import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import { db } from "./src/db/index.js";
import { generations, users } from "./src/db/schema.js";
import { requireAuth } from "./src/middleware/auth.js";
import { eq, and, desc } from "drizzle-orm";
import authRouter from "./src/routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// API Healtcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth Routes
app.use("/api/auth", authRouter);

// Lazy initialize Gemini API Client safely
let aiClient = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel inside Google AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Utility for exponential backoff retry to handle temporary 503 errors gracefully
async function retryWithBackoff(fn, retries = 5, delay = 2000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) {
      throw err;
    }
    const errMsg = err.message || "";
    // Only retry on transient 503 / UNAVAILABLE errors
    if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE")) {
      console.warn(`Gemini API call failed with transient error, retrying in ${delay}ms... Details:`, errMsg);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    } else {
      throw err;
    }
  }
}

// 1. AI Content Generation Route
app.post("/api/generate", requireAuth, async (req, res) => {
  try {
    const { journalistName, category, fullArticle } = req.body;

    if (!journalistName || !category || !fullArticle) {
      return res.status(400).json({ error: "All form fields (Journalist Name, Category, Full Article) are required." });
    }

    if (fullArticle.trim().length < 50) {
      return res.status(400).json({ error: "Article is too short. Please provide at least 50 characters of context." });
    }

    // Lazy load the Gemini client & check key
    const ai = getAiClient();

    const prompt = `
You are a highly-professional AI Social Media Assistant and Chief Editorial Editor for a news media company.
Analyze the following news article and generate:
1. A concise, professional, 3-line story summary (as an array of 3 distinct, separate summary bullet points).
2. A compelling, memorable pull quote extracted or highlighting key direct phrases from the article.
3. Caption Variant 1: A professional and concise caption optimized primarily for Twitter/X or LinkedIn (ideally below 280 characters, carrying a professional tone).
4. Caption Variant 2: A punchy, highly engaging caption optimized for Facebook or Instagram (with natural emojis, highly conversational and click-worthy yet authentic).
5. A list of 4 to 8 highly relevant hashtags matching the article topic (starting with '#').

Journalist: ${journalistName}
Category: ${category}

Full News Article:
${fullArticle}
`;

    const response = await retryWithBackoff(() => 
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              summaryLines: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Exactly 3 concise summary bullet points (each line 1-2 short sentences maximum)."
              },
              pullQuote: {
                type: "STRING",
                description: "A prominent quotation or highlight from the article (wrapped in double quotes)."
              },
              caption1: {
                type: "STRING",
                description: "Professional/informative caption for Twitter/LinkedIn."
              },
              caption2: {
                type: "STRING",
                description: "Curiosity/emoji-driven engaging caption for Instagram/Facebook."
              },
              hashtags: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "A list of relevant hashtags beginning with '#'."
              }
            },
            required: ["summaryLines", "pullQuote", "caption1", "caption2", "hashtags"]
          }
        }
      })
    );

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from the Gemini model.");
    }

    const aiOutput = JSON.parse(responseText);

    // Save history record in database
    // Two-layer database saving with query safety
    try {
      const inserted = await db.insert(generations).values({
        userId: req.user.dbId,
        journalistName,
        category,
        fullArticle,
        summary: JSON.stringify(aiOutput.summaryLines),
        pullQuote: aiOutput.pullQuote,
        caption1: aiOutput.caption1,
        caption2: aiOutput.caption2,
        hashtags: aiOutput.hashtags.join(","),
        rating: null,
      }).returning();

      return res.json(inserted[0]);
    } catch (dbErr) {
      console.error("Failed to persist generation in database:", dbErr);
      // Return successfully even if DB fails, giving transient fallback
      return res.json({
        id: -1,
        userId: req.user.dbId,
        journalistName,
        category,
        fullArticle,
        summary: JSON.stringify(aiOutput.summaryLines),
        pullQuote: aiOutput.pullQuote,
        caption1: aiOutput.caption1,
        caption2: aiOutput.caption2,
        hashtags: aiOutput.hashtags.join(","),
        rating: null,
        createdAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Failed in generating content:", error.message || error);
    // User-friendly outage check
    const errMsg = error.message || "";
    if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE")) {
      return res.status(503).json({ error: "AI service is temporarily busy. Please try again in a few moments." });
    }
    res.status(550).json({ error: errMsg || "An unexpected error occurred during story summary generation." });
  }
});

// 2. Fetch Generation History for Current User
app.get("/api/history", requireAuth, async (req, res) => {
  try {
    const userHistory = await db.query.generations.findMany({
      where: eq(generations.userId, req.user.dbId),
      orderBy: desc(generations.createdAt),
    });
    res.json(userHistory);
  } catch (err) {
    console.error("Database failed to fetch history:", err);
    res.status(500).json({ error: "Failed to load generation history from database." });
  }
});

// 3. Delete Generation from History
app.delete("/api/history/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const item = await db.query.generations.findFirst({
      where: and(
        eq(generations.id, id),
        eq(generations.userId, req.user.dbId)
      ),
    });

    if (!item) {
      return res.status(404).json({ error: "Summary record not found or unauthorized access." });
    }

    await db.delete(generations).where(eq(generations.id, id));
    res.json({ success: true, message: "Summary deleted successfully." });
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).json({ error: "Failed to delete the summary record." });
  }
});

// 4. Rate Generation (1 to 5 Stars)
app.post("/api/history/:id/rate", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rating } = req.body;

    if (isNaN(id) || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a whole number between 1 and 5." });
    }

    const item = await db.query.generations.findFirst({
      where: and(
        eq(generations.id, id),
        eq(generations.userId, req.user.dbId)
      ),
    });

    if (!item) {
      return res.status(404).json({ error: "Generation not found or unauthorized." });
    }

    await db.update(generations).set({ rating }).where(eq(generations.id, id));
    res.json({ success: true, rating });
  } catch (err) {
    console.error("Error rating record:", err);
    res.status(500).json({ error: "Failed to persist star rating." });
  }
});

// 5. Dashboard Analytics
app.get("/api/analytics", requireAuth, async (req, res) => {
  try {
    // 1. Fetch current user's generations
    const userHistory = await db.query.generations.findMany({
      where: eq(generations.userId, req.user.dbId),
    });

    // 2. Fetch global counts for the requested Admin dashboard
    let totalAllUsers = 1;
    let totalAllGenerations = userHistory.length;

    try {
      const allUsers = await db.select().from(users);
      totalAllUsers = allUsers.length > 0 ? allUsers.length : 1;

      const allGens = await db.select().from(generations);
      totalAllGenerations = allGens.length;
    } catch (globalErr) {
      console.warn("Failed to fetch global stats, defaulting to user levels:", globalErr);
    }

    // Process user data
    const totalGenerations = userHistory.length;

    // Compute average ratings
    const ratedGens = userHistory.filter(g => g.rating !== null && g.rating !== undefined);
    const averageRating = ratedGens.length > 0
      ? Number((ratedGens.reduce((sum, g) => sum + g.rating, 0) / ratedGens.length).toFixed(1))
      : 0;

    // Category tracking
    const categoryCounts = {};
    userHistory.forEach((g) => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });

    let mostUsedCategory = "None";
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        mostUsedCategory = cat;
      }
    });

    // Convert category map into charts friendly format
    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Daily Timeline Usage (Last 7 days)
    const dailyMap = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      last7Days.push(dateStr);
      dailyMap[dateStr] = 0;
    }

    userHistory.forEach((g) => {
      if (g.createdAt) {
        const dateStr = new Date(g.createdAt).toISOString().split("T")[0];
        if (dateStr in dailyMap) {
          dailyMap[dateStr]++;
        }
      }
    });

    const dailyUsage = last7Days.map((date) => {
      // Format to readable: "Jun 15"
      const [, m, d] = date.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${monthNames[parseInt(m) - 1]} ${d}`;
      return {
        date: formattedDate,
        count: dailyMap[date],
      };
    });

    // Monthly Timeline Usage (Last 6 months)
    const monthlyMap = {};
    const last6Months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = monthNames[d.getMonth()];
      last6Months.push(mLabel);
      monthlyMap[mLabel] = 0;
    }

    userHistory.forEach((g) => {
      if (g.createdAt) {
        const mLabel = monthNames[new Date(g.createdAt).getMonth()];
        if (mLabel in monthlyMap) {
          monthlyMap[mLabel]++;
        }
      }
    });

    const monthlyUsage = last6Months.map((month) => ({
      month,
      count: monthlyMap[month],
    }));

    res.json({
      summaryStats: {
        totalGenerations,
        averageRating,
        mostUsedCategory,
        totalUsers: totalAllUsers,
        totalGlobalGenerations: totalAllGenerations,
      },
      dailyUsage,
      monthlyUsage,
      categoryDistribution,
    });

  } catch (err) {
    console.error("Failed to generate analytics:", err);
    res.status(500).json({ error: "Failed to create analytics." });
  }
});

// 6. AI Guidance Chat Route
app.post("/api/guide-chat", requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getAiClient();

    // Map client-side messages to the format expected by the SDK
    const formattedContents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || "" }]
    }));

    // Add a default user message if the history is empty
    if (formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: "Hello, who are you and how can you help me?" }]
      });
    }

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: "You are the AI Editorial Guide for Namaste Telangana (నమస్తే తెలంగాణ) newsroom assistant. " +
            "You help journalists draft stories, outline headlines, improve structure, correct grammar, translate between Telugu and English, and general copywriting. " +
            "You are also a friendly system operator guiding users through the web app features: " +
            "- 'Generate Story Summary' tab: Input a news article to get summary bullet points, a pull quote, specific ready-to-share social media captions and hashtags. You can rate individual summaries or download structured PDFs. " +
            "- 'History Log' tab: View, filter, read, rate, and delete previous works. " +
            "- 'Performance & Analytics' tab: Review high-level newsroom performance, distribution density across categories and monthly trend timelines. " +
            "- 'Settings' tab: View personal credentials, select dark mode, etc. " +
            "Always respond in a direct, clear, polite, structured and editor-like tone of a chief copy editor. Use Telugu and English where appropriate to maintain brand closeness."
        }
      })
    );

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini guidance API.");
    }

    res.json({ content: text });
  } catch (error) {
    console.error("Error in guide-chat:", error.message || error);
    const errMsg = error.message || "";
    if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE")) {
      return res.status(503).json({ error: "AI service is temporarily busy. Please try again in a few moments." });
    }
    res.status(500).json({ error: errMsg || "Something went wrong during the editorial guidance session." });
  }
});


// Configure dev server mapping and asset serving with fallback
async function setupServer() {
  if (process.env.NODE_ENV !== "production" && process.env.SEPARATE_DEV !== "true") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
