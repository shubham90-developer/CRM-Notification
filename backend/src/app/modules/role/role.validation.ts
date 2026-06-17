import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
  .optional();

const permissionsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return [] as string[];
    if (Array.isArray(val)) return val.filter((v) => typeof v === 'string' && v.trim() !== '');
    const trimmed = val.trim();
    if (trimmed === '') return [] as string[];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v)).filter((v) => v.trim() !== '');
      }
    } catch {
      /* fallthrough */
    }
    return trimmed.split(',').map((v) => v.trim()).filter((v) => v !== '');
  });

export const roleValidation = z.object({
  employeeId: objectIdSchema,
  employeeName: z.string().optional(),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  permissions: permissionsSchema,
});

export const roleUpdateValidation = z.object({
  employeeId: objectIdSchema,
  employeeName: z.string().optional(),
  role: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  permissions: permissionsSchema,
  isDeleted: z.boolean().optional(),
});
