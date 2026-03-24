import { useVariantStore } from "@/lib/stores/variant-store";
import { useCartStore } from "@/lib/stores/cart-store";

export function useProductVariants(product: any) {
  const { selections, setSelection } = useVariantStore();
  const { setSelectedVariants } = useCartStore();

  const selectedOptions = selections[product._id] || {};
  const hasVariants = product.variants?.length > 0;

  const isValidOption = (variantName: string, value: string) => {
    return product.variantCombinations.some((combo: any) => {
      return (
        combo.options.some(
          (opt: any) => opt.name === variantName && opt.value === value,
        ) &&
        Object.entries(selectedOptions)
          .filter(([k]) => k !== variantName)
          .every(([k, v]) =>
            combo.options.some((opt: any) => opt.name === k && opt.value === v),
          )
      );
    });
  };

  const selectOption = (variantName: string, value: string) => {
    setSelection(product._id, variantName, value);

    // 🔥 Convert to backend format
    const updated = {
      ...selectedOptions,
      [variantName]: value,
    };

    const variantArray = Object.entries(updated).map(([name, value]) => ({
      name,
      value,
    }));

    // 🔥 Sync with cart
    setSelectedVariants(product._id, []);
  };

  const selectedCombination =
    hasVariants &&
    Object.keys(selectedOptions).length === product.variants.length
      ? product.variantCombinations.find((combo: any) =>
          product.variants.every((variant: any) =>
            combo.options.some(
              (opt: any) =>
                opt.name === variant.name &&
                opt.value === selectedOptions[variant.name],
            ),
          ),
        )
      : null;

  const currentStock = selectedCombination
    ? selectedCombination.stock
    : product.stock;

  return {
    selectedOptions,
    selectOption,
    isValidOption,
    selectedCombination, // ✅ ADD THIS
    currentStock,
    hasVariants,
  };
}
