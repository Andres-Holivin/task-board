import { z } from "zod"

const envSchema = z.object({
    PORT: z.string().regex(/^\d+$/, { message: "PORT must be a number" }).transform(Number).default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
    NEXT_PUBLIC_API_TIMEOUT: z.string().regex(/^\d+$/, { message: "NEXT_PUBLIC_API_TIMEOUT must be a number" }).transform(Number).default(5000),
});

export const validateEnvServer = async () => await envSchema.safeParseAsync(process.env);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ProcessEnv extends z.infer<typeof envSchema> { }
    }
}