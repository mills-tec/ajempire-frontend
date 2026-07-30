import type { SelectedVariant } from "@/lib/stores/cart-store";
import { useVariantStore } from "@/lib/stores/variant-store";
import type { Product } from "@/lib/types";
import { useMemo } from "react";

type SelectedOptions = Record<string, string>;

// Stable fallback reference — `selections[productId] || {}` would otherwise
// hand back a brand-new empty object every render for a product with no
// selections yet, defeating the useMemo below (its identity would never
// match across renders even though nothing changed).
const EMPTY_SELECTIONS: SelectedOptions = {};

const normalizeVariantName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const optionNameMatches = (optionName: string, variantName: string) =>
  optionName === variantName ||
  normalizeVariantName(optionName) === normalizeVariantName(variantName);

const getAvailableVariants = (product: Product) => {
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

const matchesSelections = (product: Product, selections: SelectedOptions) => {
  const combinations = product.variantCombinations ?? [];
  const entries = Object.entries(selections);

  if (entries.length === 0 || combinations.length === 0) {
    return true;
  }

  return combinations.some(
    (combo) =>
      combo.stock > 0 &&
      entries.every(([name, value]) =>
        combo.options.some(
          (option) =>
            optionNameMatches(option.name, name) && option.value === value,
        ),
      ),
  );
};

const normalizeSelections = (
  product: Product,
  rawSelections: SelectedOptions,
  lockedVariantName?: string,
) => {
  const normalized: SelectedOptions = {};
  const variants = getAvailableVariants(product);

  if (lockedVariantName) {
    const lockedVariant = variants.find(
      (variant) => variant.name === lockedVariantName,
    );
    const lockedValue = rawSelections[lockedVariantName];

    if (
      lockedVariant &&
      lockedValue &&
      lockedVariant.values.includes(lockedValue)
    ) {
      normalized[lockedVariantName] = lockedValue;
    }
  }

  for (const variant of variants) {
    if (variant.name === lockedVariantName) continue;

    const value = rawSelections[variant.name];
    if (!value || !variant.values.includes(value)) continue;

    const candidateSelections = {
      ...normalized,
      [variant.name]: value,
    };

    if (matchesSelections(product, candidateSelections)) {
      normalized[variant.name] = value;
    }
  }

  return normalized;
};

const buildSelectedVariants = (
  product: Product,
  selections: SelectedOptions,
): SelectedVariant[] =>
  getAvailableVariants(product)
    .filter((variant) => Boolean(selections[variant.name]))
    .map((variant) => ({
      name: variant.name,
      value: selections[variant.name],
    }));

export function useProductVariants(product?: Product | null) {
  const { selections, setSelections } = useVariantStore();
  const productId = product?._id ?? "";
  const rawSelections = productId
    ? selections[productId] || EMPTY_SELECTIONS
    : EMPTY_SELECTIONS;

  // `product` and `rawSelections` are the only real inputs — memoizing here
  // means callers get stable array/object identities across renders where
  // neither actually changed, instead of recomputing (and handing back new
  // references) on every render regardless.
  const derived = useMemo(() => {
    const availableVariants = product ? getAvailableVariants(product) : [];
    const hasVariants = availableVariants.length > 0;
    const selectedOptions =
      product && hasVariants
        ? normalizeSelections(product, rawSelections)
        : EMPTY_SELECTIONS;

    const selectedVariantsArray =
      product && hasVariants
        ? buildSelectedVariants(product, selectedOptions)
        : [];

    const selectedCombination =
      product &&
      hasVariants &&
      selectedVariantsArray.length === availableVariants.length
        ? ((product.variantCombinations ?? []).find((combo) =>
            availableVariants.every((variant) =>
              combo.options.some(
                (option) =>
                  optionNameMatches(option.name, variant.name) &&
                  option.value === selectedOptions[variant.name],
              ),
            ),
          ) ?? null)
        : null;

    const missingVariantName =
      product && hasVariants
        ? (availableVariants.find((variant) => !selectedOptions[variant.name])
            ?.name ?? null)
        : null;

    const currentStock = selectedCombination?.stock ?? product?.stock ?? 0;

    return {
      availableVariants,
      hasVariants,
      selectedOptions,
      selectedVariantsArray,
      selectedCombination,
      missingVariantName,
      currentStock,
    };
  }, [product, rawSelections]);

  const isValidOption = (variantName: string, value: string) => {
    if (!product || !derived.hasVariants) return true;

    const variant = derived.availableVariants.find(
      (item) => item.name === variantName,
    );
    if (!variant || !variant.values.includes(value)) return false;

    return matchesSelections(product, {
      ...derived.selectedOptions,
      [variantName]: value,
    });
  };

  const selectOption = (variantName: string, value: string) => {
    if (!product || !productId) return;

    const updatedSelections = normalizeSelections(
      product,
      {
        ...derived.selectedOptions,
        [variantName]: value,
      },
      variantName,
    );

    setSelections(productId, updatedSelections);
  };

  return {
    selectedOptions: derived.selectedOptions,
    selectOption,
    isValidOption,
    selectedVariantsArray: derived.selectedVariantsArray,
    missingVariantName: derived.missingVariantName,
    selectedCombination: derived.selectedCombination,
    currentStock: derived.currentStock,
    hasVariants: derived.hasVariants,
    availableVariants: derived.availableVariants,
  };
}
