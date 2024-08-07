import { relations } from "drizzle-orm";
import {
    timestamp,
    text,
    pgEnum,
    serial,
    pgTable,
    integer,
  } from "drizzle-orm/pg-core";
  import { sql } from "drizzle-orm";

  
  export const accountTypeEnum = pgEnum("type", ["email", "google"]);
  
  export const users = pgTable("gf_user", {
    id: serial("id").primaryKey(),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
  });
  
  export const accounts = pgTable("gf_accounts", {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountType: accountTypeEnum("accountType").notNull(),
    googleId: text("googleId").unique(),
    password: text("password"),
    salt: text("salt"),
  });
  
  export const magicLinks = pgTable("gf_magic_links", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("tokenExpiresAt", { mode: "date" }),
  });
  
  export const resetTokens = pgTable("gf_reset_tokens", {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("tokenExpiresAt", { mode: "date" }),
  });
  
  export const verifyEmailTokens = pgTable("gf_verify_email_tokens", {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    token: text("token"),
    tokenExpiresAt: timestamp("tokenExpiresAt", { mode: "date" }),
  });
  
  export const profiles = pgTable("gf_profile", {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    displayName: text("displayName"),
    imageId: text("imageId"),
    image: text("image"),
    bio: text("bio").notNull().default(""),
  });
  
  export const sessions = pgTable("gf_session", {
    id: text("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  });

/**
 * RELATIONSHIPS
 *
 * comming soon??
 */



  
  /**
 * TYPES
 *
 * You can create and export types from your schema to use in your application.
 * This is useful when you need to know the shape of the data you are working with
 * in a component or function.
 */

  export type User = typeof users.$inferSelect;
  export type Account = typeof accounts.$inferSelect;
  export type Profile = typeof profiles.$inferSelect;
  export type Session = typeof sessions.$inferSelect;