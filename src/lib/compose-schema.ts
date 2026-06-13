import { z } from "zod"

export const composeSchema = z.object({
  to: z.string().min(1, "Recipient is required").email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().optional(),
})

export type ComposeSchema = z.infer<typeof composeSchema>
