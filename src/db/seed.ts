import "dotenv/config";
import { database, pg } from "./index";
import { accounts, profiles, users } from "@/db/schema";
import crypto from "crypto";

// Funktion zur Generierung eines zufälligen Salt-Werts
const generateSalt = () => {
  return crypto.randomBytes(16).toString("base64");
};

// Funktion zur Generierung eines gehashten Passworts
const hashPassword = (password: string, salt: string) => {
  const hash = crypto.createHmac("sha256", salt);
  hash.update(password);
  return hash.digest("hex");
};

async function main() {
  const salt = generateSalt();
  const hashedPassword = hashPassword("securepassword", salt);

  const [user] = await database
    .insert(users)
    .values({
      email: "testing@example.com",
      emailVerified: undefined,
    })
    .onConflictDoNothing()
    .returning();

  const [account] = await database
    .insert(accounts)
    .values({
      accountType: "email",
      googleId: undefined,
      password: hashedPassword,
      salt: salt,
      userId: user.id,
    })
    .onConflictDoNothing()
    .returning();

  const [profile] = await database
    .insert(profiles)
    .values({
      userId: user.id,
      displayName: "Test User",
    })
    .onConflictDoNothing()
    .returning();

  await pg.end();
}

main();