import { z } from "zod";

export const menuMasterValidation = z.object({
  itemName: z.string().min(2, "Title must be at least 2 characters long"),
  image: z.string().optional(),
  desc: z.string().optional(),
  priority: z.string().optional(),
  qty: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const menuMasterUpdateValidation = z.object({
  itemName: z
    .string()
    .min(2, "Title must be at least 2 characters long")
    .optional(),
  image: z.string().optional(),
  desc: z.string().optional(),
  priority: z.string().optional(),
  qty: z.string().optional(),
  isDeleted: z.boolean().optional(),
});
