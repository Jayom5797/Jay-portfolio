/**
 * Public profile / contact configuration.
 *
 * Uses NEXT_PUBLIC_* env vars so both server and client components can read
 * them, with safe fallbacks. Update these in .env (and in Vercel) — no code
 * changes needed. The profile image and resume are served from object storage
 * (uploaded by the import script), so they work on serverless hosts too.
 */
export const profile = {
  name: process.env.NEXT_PUBLIC_PROFILE_NAME ?? "Jay",
  title:
    process.env.NEXT_PUBLIC_PROFILE_TITLE ??
    "Mechanical Design / CAD / Engineering",

  // Public asset URLs (set to the S3 public URLs after import).
  imageUrl: process.env.NEXT_PUBLIC_PROFILE_IMAGE ?? "",
  resumeUrl: process.env.NEXT_PUBLIC_RESUME_URL ?? "",

  // Contact
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",

  /** Whether to show the phone number publicly. */
  showPhone:
    (process.env.NEXT_PUBLIC_SHOW_PHONE ?? "true").toLowerCase() !== "false",
};

export type Profile = typeof profile;
