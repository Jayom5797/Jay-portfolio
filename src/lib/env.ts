/**
 * Centralized, typed access to environment variables.
 * Keeps configuration in one place so nothing reads process.env directly.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",

  authSecret: process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",

  admin: {
    email: process.env.ADMIN_EMAIL ?? "jay@example.com",
    password: process.env.ADMIN_PASSWORD ?? "change-me",
    name: process.env.ADMIN_NAME ?? "Jay",
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER ?? "local") as "local" | "s3",
    localDir: process.env.STORAGE_LOCAL_DIR ?? "./storage",
    s3: {
      endpoint: process.env.S3_ENDPOINT ?? "",
      region: process.env.S3_REGION ?? "auto",
      bucket: process.env.S3_BUCKET ?? "",
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      publicUrl: process.env.S3_PUBLIC_URL ?? "",
    },
  },

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  requireS3() {
    return {
      endpoint: required("S3_ENDPOINT", process.env.S3_ENDPOINT),
      region: process.env.S3_REGION ?? "auto",
      bucket: required("S3_BUCKET", process.env.S3_BUCKET),
      accessKeyId: required("S3_ACCESS_KEY_ID", process.env.S3_ACCESS_KEY_ID),
      secretAccessKey: required("S3_SECRET_ACCESS_KEY", process.env.S3_SECRET_ACCESS_KEY),
      publicUrl: required("S3_PUBLIC_URL", process.env.S3_PUBLIC_URL),
    };
  },
};
