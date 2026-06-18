import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    let uid;
    let email;
    let dbId;

    if (token === "dev-token" || token.startsWith("dev-token")) {
      // Local development auth bypass (backwards compatible)
      uid = "dev-user-uid";
      email = "developer@newsroom-ai.com";
      
      if (token.includes(":")) {
        const parts = token.split(":");
        uid = parts[1] || uid;
        email = parts[2] || email;
      }

      let dbUser = await db.query.users.findFirst({
        where: eq(users.uid, uid),
      });

      if (!dbUser) {
        const inserted = await db
          .insert(users)
          .values({
            uid,
            email,
          })
          .returning();
        dbUser = inserted[0];
      }
      dbId = dbUser.id;
    } else {
      // Custom session database validation
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.sessionToken, token),
      });

      if (!session || new Date(session.expiresAt) < new Date()) {
        return res.status(401).json({ error: "Unauthorized: Session expired or invalid" });
      }

      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });

      if (!dbUser) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      uid = dbUser.uid;
      email = dbUser.email;
      dbId = dbUser.id;
    }

    req.user = {
      uid,
      email,
      dbId,
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid session" });
  }
};
