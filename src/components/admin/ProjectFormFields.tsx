import { Field, inputClass, textareaClass } from "./Field";
import { CaseStudyEditor } from "./CaseStudyEditor";
import type { CategoryDTO, ProjectDTO } from "@/lib/types";

/**
 * All project fields. Shared between the "new" and "edit" forms. `project` is
 * undefined when creating. Arrays are rendered as comma/newline lists.
 */
export function ProjectFormFields({
  project,
  categories,
}: {
  project?: ProjectDTO;
  categories: CategoryDTO[];
}) {
  const list = (arr?: string[]) => (arr && arr.length ? arr.join(", ") : "");

  return (
    <div className="space-y-10">
      {/* Basic info */}
      <section className="space-y-5">
        <h2 className="tech-label text-accent-bright">Project Information</h2>

        <Field label="Title">
          <input
            name="title"
            defaultValue={project?.title ?? ""}
            required
            placeholder="e.g. Robotic Arm"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Slug"
            hint="Leave blank to auto-generate from the title. Used in the public URL: /projects/<slug>"
          >
            <input
              name="slug"
              defaultValue={project?.slug ?? ""}
              placeholder="robotic-arm"
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <select
              name="categoryId"
              defaultValue={project?.category?.id ?? ""}
              className={inputClass}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Short description" hint="One or two sentences shown on cards and previews.">
          <textarea
            name="shortDescription"
            defaultValue={project?.shortDescription ?? ""}
            placeholder="A concise summary of the project."
            className={textareaClass}
          />
        </Field>

        <Field label="Overview / full description" hint="Longer intro shown on the project page. Separate paragraphs with a blank line.">
          <textarea
            name="description"
            defaultValue={project?.description ?? ""}
            className={`${textareaClass} min-h-[160px]`}
          />
        </Field>
      </section>

      {/* Technical metadata */}
      <section className="space-y-5">
        <h2 className="tech-label text-accent-bright">Technical Information</h2>
        <p className="-mt-2 text-xs text-steel-500">
          Enter comma-separated values for list fields. Only fields you fill in are
          shown publicly — nothing is invented.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Software" hint="e.g. SolidWorks, Autodesk Inventor">
            <input name="software" defaultValue={list(project?.software)} className={inputClass} />
          </Field>
          <Field label="Project type" hint="e.g. Assembly, Product, Prototype">
            <input name="projectType" defaultValue={project?.projectType ?? ""} className={inputClass} />
          </Field>
          <Field label="Materials" hint="Comma-separated">
            <input name="materials" defaultValue={list(project?.materials)} className={inputClass} />
          </Field>
          <Field label="Components" hint="Comma-separated">
            <input name="components" defaultValue={list(project?.components)} className={inputClass} />
          </Field>
          <Field label="Dimensions">
            <input name="dimensions" defaultValue={project?.dimensions ?? ""} className={inputClass} />
          </Field>
          <Field label="Year">
            <input name="year" defaultValue={project?.year ?? ""} className={inputClass} />
          </Field>
          <Field label="Role">
            <input name="role" defaultValue={project?.role ?? ""} className={inputClass} />
          </Field>
          <Field label="Tools" hint="Comma-separated">
            <input name="tools" defaultValue={list(project?.tools)} className={inputClass} />
          </Field>
        </div>

        <Field label="Tags" hint="Comma-separated. Used for search and filtering.">
          <input name="tags" defaultValue={list(project?.tags)} className={inputClass} />
        </Field>
      </section>

      {/* Case study */}
      <section className="space-y-5">
        <h2 className="tech-label text-accent-bright">Case Study</h2>
        <CaseStudyEditor initial={project?.caseStudy ?? []} />
      </section>

      {/* Publication */}
      <section className="space-y-5">
        <h2 className="tech-label text-accent-bright">Publication</h2>
        <div className="flex flex-wrap items-center gap-8">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={project?.featured ?? false}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm text-steel-200">
              Featured
              <span className="block text-xs text-steel-500">
                Eligible for the homepage
              </span>
            </span>
          </label>
        </div>
        {/* Status is set via the Save Draft / Publish buttons (hidden field). */}
      </section>
    </div>
  );
}
