import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chatMessages: defineTable({
    userId: v.string(),
    userMessage: v.string(),
    assistantMessage: v.string(),
  }).index("by_user", ["userId"]),
});
