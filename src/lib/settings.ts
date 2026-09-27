import { db } from "./db";
import { profile as envProfile } from "./profile";

export interface ResolvedProfile {
  name: string;
  title: string;
  imageUrl: string;
  image2Url: string;
  fullBodyImageUrl: string;
  resumeUrl: string;
  email: string;
  phone: string;
  linkedin: string;
  showPhone: boolean;
}

const SINGLETON_ID = "singleton";

/** Read the settings row, creating it on first access. */
export async function getSiteSettings() {
  return db.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

function pick(dbValue: string, envValue: string): string {
  return dbValue && dbValue.trim().length > 0 ? dbValue : envValue;
}

/**
 * Resolved public profile: DB settings take precedence, falling back to the
 * NEXT_PUBLIC_* env values when a field is unset. This lets the site work from
 * env on day one and be fully editable from the admin panel thereafter.
 */
export async function getProfile(): Promise<ResolvedProfile> {
  const s = await getSiteSettings();
  return {
    name: pick(s.profileName, envProfile.name),
    title: pick(s.profileTitle, envProfile.title),
    imageUrl: pick(s.profileImageUrl, envProfile.imageUrl),
    image2Url: s.profileImage2Url,
    fullBodyImageUrl: s.fullBodyImageUrl,
    resumeUrl: pick(s.resumeUrl, envProfile.resumeUrl),
    email: pick(s.contactEmail, envProfile.email),
    phone: pick(s.contactPhone, envProfile.phone),
    linkedin: pick(s.linkedinUrl, envProfile.linkedin),
    // showPhone: DB boolean is authoritative once the row exists.
    showPhone: s.showPhone,
  };
}
