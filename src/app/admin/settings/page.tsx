import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSessionUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getSessionUser();

  const rows: { label: string; value: string }[] = [
    { label: "Signed in as", value: user?.name ?? "—" },
    { label: "Email", value: user?.email ?? "—" },
    { label: "Role", value: user?.role ?? "—" },
    { label: "Storage provider", value: env.storage.provider },
    { label: "Site URL", value: env.siteUrl },
  ];

  return (
    <div>
      <AdminHeader title="Settings" description="Account and system configuration" />

      <div className="max-w-2xl space-y-10 p-8">
        <section>
          <h2 className="tech-label text-accent-bright">System</h2>
          <div className="mt-4 border border-steel-800">
            <dl className="divide-y divide-steel-800">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 px-5 py-3">
                  <dt className="tech-label pt-0.5">{r.label}</dt>
                  <dd className="text-right text-sm text-steel-200">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <h2 className="tech-label text-accent-bright">Storage</h2>
          <p className="mt-3 text-sm leading-relaxed text-steel-300">
            Uploaded 3D models and media are handled through a swappable storage
            provider. The default <code className="text-steel-200">local</code> provider
            keeps files outside the app bundle in a git-ignored{" "}
            <code className="text-steel-200">/storage</code> directory. To use object
            storage (AWS S3, Cloudflare R2, etc.), set{" "}
            <code className="text-steel-200">STORAGE_PROVIDER=s3</code> and the related
            <code className="text-steel-200"> S3_*</code> variables in your environment —
            no code changes required.
          </p>
        </section>

        <section>
          <h2 className="tech-label text-accent-bright">Administrators</h2>
          <p className="mt-3 text-sm leading-relaxed text-steel-300">
            The initial administrator is created from the{" "}
            <code className="text-steel-200">ADMIN_*</code> environment variables by the
            seed script. The data model supports multiple administrators, so additional
            accounts can be added later.
          </p>
        </section>
      </div>
    </div>
  );
}
