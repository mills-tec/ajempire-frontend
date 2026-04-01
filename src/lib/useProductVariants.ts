import type { SelectedVariant } from "@/lib/stores/cart-store";
import { useVariantStore } from "@/lib/stores/variant-store";
import type { Product } from "@/lib/types";

type SelectedOptions = Record<string, string>;

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

  return combinations.some((combo) =>
    entries.every(([name, value]) =>
      combo.options.some(
        (option) => optionNameMatches(option.name, name) && option.value === value,
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
    const lockedVariant = variants.find((variant) => variant.name === lockedVariantName);
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
  const rawSelections = productId ? selections[productId] || {} : {};
  const availableVariants = product ? getAvailableVariants(product) : [];
  const hasVariants = availableVariants.length > 0;
  const selectedOptions =
    product && hasVariants ? normalizeSelections(product, rawSelections) : {};

  const isValidOption = (variantName: string, value: string) => {
    if (!product || !hasVariants) return true;

    const variant = availableVariants.find((item) => item.name === variantName);
    if (!variant || !variant.values.includes(value)) return false;

    return matchesSelections(product, {
      ...selectedOptions,
      [variantName]: value,
    });
  };

  const selectOption = (variantName: string, value: string) => {
    if (!product || !productId) return;

    const updatedSelections = normalizeSelections(
      product,
      {
        ...selectedOptions,
        [variantName]: value,
      },
      variantName,
    );

    setSelections(productId, updatedSelections);
  };

  const selectedVariantsArray =
    product && hasVariants ? buildSelectedVariants(product, selectedOptions) : [];

  const selectedCombination =
    product &&
    hasVariants &&
    selectedVariantsArray.length === availableVariants.length
      ? (product.variantCombinations ?? []).find((combo) =>
          availableVariants.every((variant) =>
            combo.options.some(
              (option) =>
                optionNameMatches(option.name, variant.name) &&
                option.value === selectedOptions[variant.name],
            ),
          ),
        ) ?? null
      : null;

  const missingVariantName =
    product && hasVariants
      ? availableVariants.find((variant) => !selectedOptions[variant.name])?.name ?? null
      : null;

  const currentStock = selectedCombination?.stock ?? product?.stock ?? 0;

  return {
    selectedOptions,
    selectOption,
    isValidOption,
    selectedVariantsArray,
    missingVariantName,
    selectedCombination,
    currentStock,
    hasVariants,
    availableVariants,
  };
}
