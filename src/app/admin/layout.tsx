import { getSessionUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Unauthenticated (e.g. the login page): render children with no chrome.
  // Middleware already redirects protected routes to /admin/login.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={user.name} />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
