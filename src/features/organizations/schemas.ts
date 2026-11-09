import { z } from "zod";
import { normalizedEmailSchema } from "@/features/auth/schemas";

const memberRoles = ["ADMIN", "EDITOR", "PHOTOGRAPHER", "VIEWER"] as const;

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slugSchema.optional(),
});

export const updateOrganizationSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    slug: slugSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export const inviteOrganizationMemberSchema = z.object({
  email: normalizedEmailSchema,
  role: z.enum(memberRoles),
});

export const updateOrganizationMemberSchema = z.object({
  role: z.enum(memberRoles),
});

export const respondToInvitationSchema = z.object({
  decision: z.enum(["accept", "decline"]),
});

export type InviteableOrganizationRole = (typeof memberRoles)[number];
