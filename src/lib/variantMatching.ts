import type { Product } from "@/lib/types";

// Shared, framework-free variant helpers — used by both useProductVariants
// (interactive selection UI) and buildCartItem (resolving a *complete*
// selection to a price/stock at add-to-cart time). Kept in one place so the
// two never quietly diverge on what counts as a matching variant name.

export const normalizeVariantName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const optionNameMatches = (optionName: string, variantName: string) =>
  optionName === variantName ||
  normalizeVariantName(optionName) === normalizeVariantName(variantName);

export const getAvailableVariants = (product: Product) => {
  const explicitVariants = (product.variants ?? []).filter(
    (variant) => Array.isArray(variant.values) && variant.values.length > 0,
  );

  if (explicitVariants.length > 0) return explicitVariants;

  const combos = product.variantCombinations ?? [];
  const variantNameMap = new Map<string, Set<string>>();

  combos.forEach((combo) => {
    combo.options.forEach((option) => {
      const existing = variantNameMap.get(option.name) ?? new Set<string>();
      existing.add(option.value);
      variantNameMap.set(option.name, existing);
    });
  });

  if (variantNameMap.size === 0) return [];

  return Array.from(variantNameMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));
};
