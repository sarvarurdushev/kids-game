import { z } from "zod";

export const classroomProgramSchema = z.enum([
  "story_craft",
  "discovery",
  "mission_english",
  "creative",
]);

export const classroomEventSchema = z.object({
  external_event_id: z.string().min(1).max(200).nullable().optional(),
  student_external_id: z.string().min(1).max(200),
  program: classroomProgramSchema.nullable().optional(),
  attendance: z.boolean().optional(),
  participation_score: z.number().min(0).max(100).optional(),
  speaking_score: z.number().min(0).max(100).optional(),
  confidence_score: z.number().min(0).max(100).optional(),
  teamwork_score: z.number().min(0).max(100).optional(),
  engagement_score: z.number().min(0).max(100).optional(),
  behavior_score: z.number().min(0).max(100).optional(),
  activity_completed: z.boolean().optional(),
  occurred_at: z.string().datetime().optional(),
});

export type ClassroomEventBody = z.infer<typeof classroomEventSchema>;
