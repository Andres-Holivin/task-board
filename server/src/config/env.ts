import { z } from "zod";
const envSchema = z.object({
    PORT: z.string().regex(/^\d+$/, { message: "PORT must be a number" }).transform(Number).default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    REQUEST_TIMEOUT: z.string().regex(/^\d+$/, { message: "REQUEST_TIMEOUT must be a number" }).transform(Number).default(30000),

    // Supabase Configuration
    SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
    SUPABASE_ANON_KEY: z.string().min(1, { message: "SUPABASE_ANON_KEY is required" }),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: "SUPABASE_SERVICE_ROLE_KEY is required" }),
    SUPABASE_JWT_SECRET: z.string().min(1, { message: "SUPABASE_JWT_SECRET is required" }),

    ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required").transform((val) => val.split(',')),

    // Gemini AI Configuration
    GEMINI_API_KEY: z.string().min(1, { message: "GEMINI_API_KEY is required" }),

    // SMTP Configuration
    SMTP_HOST: z.string().min(1, { message: "SMTP_HOST is required" }),
    SMTP_PORT: z.string().regex(/^\d+$/, { message: "SMTP_PORT must be a number" }).transform(Number).default(587),
    SMTP_USER: z.string().min(1, { message: "SMTP_USER is required" }),
    SMTP_PASS: z.string().min(1, { message: "SMTP_PASS is required" }),
    SMTP_SENDER_NAME: z.string().default("Task Board App"),
});
export type Env = z.infer<typeof envSchema>;
export const validateEnv = async (): Promise<Env> => {
    const result = await envSchema.safeParseAsync(process.env);
    if (!result.success) {
        console.error('Environment validation errors:', result.error.issues);
        throw new Error("Invalid environment variables");
    }
    return result.data;
};
