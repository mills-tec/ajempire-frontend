import { getAvailableVariants, optionNameMatches } from "@/lib/variantMatching";
import type { Product } from "@/lib/types";
import { calcDiscountPrice } from "@/lib/utils";
import type { CartItem, SelectedVariant } from "@/lib/stores/cart-store";

// What a caller (UI, "buy again", bulk wishlist-add, etc.) needs to express
// to add something to the cart. Everything else — price, discount, stock,
// which variant combination was picked — is a business rule, not something
// the caller should have to compute.
export type AddCartItemInput = {
  product: Product;
  quantity: number;
  selectedVariants?: SelectedVariant[];
};

export type BuildCartItemResult =
  | { ok: true; item: CartItem }
  | { ok: false; error: string };

// Single source of truth for turning "a product the user wants, in some
// quantity, with some variant choices" into a priced CartItem. Anything that
// affects what a customer pays or how much stock they can buy belongs here,
// and nowhere else.
export function buildCartItem({
  product,
  quantity,
  selectedVariants = [],
}: AddCartItemInput): BuildCartItemResult {
  const availableVariants = getAvailableVariants(product);
  const hasVariants = availableVariants.length > 0;

  if (hasVariants && selectedVariants.length !== availableVariants.length) {
    return {
      ok: false,
      error: `Please select all required variants for "${product.name}" before adding to cart`,
    };
  }

  const selectedCombination = hasVariants
    ? ((product.variantCombinations ?? []).find((combo) =>
        availableVariants.every((variant) => {
          const picked = selectedVariants.find((sv) =>
            optionNameMatches(sv.name, variant.name),
          );
          return (
            picked &&
            combo.options.some(
              (option) =>
                optionNameMatches(option.name, variant.name) &&
                option.value === picked.value,
            )
          );
        }),
      ) ?? null)
    : null;

  const basePrice = product.price + (selectedCombination?.additionalPrice ?? 0);
  const finalPrice = product.flashSales
    ? calcDiscountPrice(
        basePrice,
        product.flashSales.discountValue,
        product.flashSales.discountType,
      )
    : basePrice;
  const discount = basePrice - finalPrice;
  const stock = selectedCombination?.stock ?? product.stock ?? 0;

  return {
    ok: true,
    item: {
      ...product,
      // `price` deliberately stays the RAW catalogue price; `basePrice` is the
      // variant-adjusted one. This used to be `price: basePrice`, which made a
      // CartItem unsafe to feed back through this function — re-pricing a line
      // after a variant change added `additionalPrice` a second time — and left
      // `price` meaning two different things depending on whether the line came
      // from here or from backendItemToCartItem (which keeps it raw).
      basePrice,
      finalPrice,
      discount,
      stock,
      quantity,
      selectedVariants,
      selected: false, // caller-agnostic default — addItem decides selection on insert
    },
  };
}
