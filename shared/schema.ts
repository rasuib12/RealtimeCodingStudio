import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  ownerId: integer("owner_id").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'chat' or 'drawing'
  data: jsonb("data"), // For drawing data
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  ownerId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  documentId: true,
  userId: true,
  content: true,
  type: true,
  data: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Message = typeof messages.$inferSelect;
