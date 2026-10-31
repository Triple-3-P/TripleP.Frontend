import { z } from 'zod';

export const accountSchema = z.object({
  email: z.string().email(),
  isEmailConfirmed: z.boolean(),
});

export type TAccount = z.infer<typeof accountSchema>;
