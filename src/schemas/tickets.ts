import { z } from "zod"


export const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  type: z.enum(["general", "bug", "feature_request", "support", "billing", "other"]),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional()
})
