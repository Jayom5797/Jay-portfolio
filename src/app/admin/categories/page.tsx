import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { getAllCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <AdminHeader
        title="Categories"
        description="Organize projects. Categories are fully managed here — no code changes needed."
      />
      <div className="p-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
