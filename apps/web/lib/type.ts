import { z } from 'zod';

export type FormState =
  | {
      message?: string;
      error?: {
        name?: string;
        email?: string;
        password?: string[];
      };
    }
  | undefined;

export const SignupFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
  email: z.email({ message: 'Invalid email address' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    )
    .trim()
});

export const SignInFormSchema = z.object({
  email: z.email({message: "Please enter a valid email."}),
  password: z.string().min(1, { message: "Password field must not be empty."})
})
