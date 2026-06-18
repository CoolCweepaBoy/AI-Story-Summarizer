import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// 1. REGISTER
router.post("/register", async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Please complete all fields in the registration form." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match. Please verify." });
  }

  try {
    // Check if account already exists with this email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.trim().toLowerCase()),
    });

    if (existingUser) {
      return res.status(400).json({ error: "Account already exists with this email." });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create unique uid (mimicking Firebase Auth UID format or similar unique text)
    const uid = "custom-uid-" + crypto.randomBytes(16).toString("hex");

    // Store user securely
    await db.insert(users).values({
      uid,
      email: email.trim().toLowerCase(),
      fullName,
      passwordHash,
    }).returning();

    return res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter both email and password." });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.trim().toLowerCase()),
    });

    if (!user) {
      return res.status(400).json({ error: "Account not found." });
    }

    // Verify hashed password
    if (!user.passwordHash) {
      // If user signed up via Google first, they won't have a password set.
      return res.status(400).json({ error: "Invalid password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password." });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    
    // Session expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Persist session in the database
    await db.insert(sessions).values({
      userId: user.id,
      sessionToken,
      expiresAt: expiresAt,
    }).returning();

    return res.status(200).json({
      token: sessionToken,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// 3. LOGOUT
router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Invalid request: Missing authorization token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    await db.delete(sessions).where(eq(sessions.sessionToken, token));
    return res.status(200).json({ message: "Successfully logged out." });
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ error: "Internal server error during logout." });
  }
});

// 4. ME (CURRENT USER PROFILE)
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, token),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json({
      email: user.email,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error("Failed to retrieve user profile:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
