import type { AdminCategoryNode } from "@/services/admin/types";

/**
 * Multi-select de subcategorías agrupadas por categoría (checkboxes `name="categoryIds"`).
 * Una categoría sin subcategorías se ofrece ella misma.
 */
export function CategoryPicker({
  tree,
  selected,
  error,
}: {
  tree: AdminCategoryNode[];
  selected: string[];
  error?: string;
}) {
  if (tree.length === 0) return <p className="text-sm text-muted">Primero crea categorías.</p>;
  return (
    <div className="flex flex-col gap-3">
      {tree.map((root) => {
        const options = root.children.length ? root.children : [root];
        return (
          <fieldset key={root.id} className="min-w-0">
            <legend className="mb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-muted">{root.name}</legend>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3 text-sm text-ink has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary"
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={option.id}
                    defaultChecked={selected.includes(option.id)}
                    className="size-4 accent-primary"
                  />
                  {option.name}
                  {!option.isVisible && <span className="text-xs text-muted">(oculta)</span>}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
      {error && <p role="alert" data-field-error className="text-sm text-danger">{error}</p>}
    </div>
  );
}
