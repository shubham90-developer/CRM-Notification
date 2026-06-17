import { z } from "zod";

export const generalSettingsValidation = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .optional(),
    changePassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    confirmPassword: z.string().optional(),
    // logo handled separately via file upload (cloudinary URL injected by controller)
    logo: z.string().optional(),
    notificationAudio: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.changePassword || data.confirmPassword) {
        return data.changePassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "changePassword and confirmPassword do not match",
      path: ["confirmPassword"],
    },
  );
