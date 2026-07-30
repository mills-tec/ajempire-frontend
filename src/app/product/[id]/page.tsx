import { getProduct } from "@/lib/api";
import type { Metadata } from "next";
import { cache } from "react";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

// Wrapped in React's cache() so generateMetadata and the page component
// below — both of which need the same product — dedupe to a single fetch
// per request instead of two separate round trips to the backend.
const getCachedProduct = cache((id: string) => getProduct(id));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const data = await getCachedProduct(id);
    const product = data?.message?.product;

    if (!product) {
      return {
        title: "Product Not Found - AJ Empire",
      };
    }

    const image = product.cover_image || product.images?.[0] || "/icon-512.png";

    return {
      title: `${product.name} - AJ Empire`,
      description:
        product.description?.slice(0, 160) ||
        "Discover premium cosmetics at AJ Empire.",
      openGraph: {
        title: product.name,
        description:
          product.description?.slice(0, 160) ||
          "Discover premium cosmetics at AJ Empire.",
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description:
          product.description?.slice(0, 160) ||
          "Discover premium cosmetics at AJ Empire.",
        images: [image],
      },
    };
  } catch {
    return {
      title: "AJ Empire - Premium Cosmetics & Beauty Products",
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  // Same fetch generateMetadata already made above — cache() dedupes it to
  // one network call. Passed down as initialData so the client query has
  // real data on its very first render (including the SSR pass), instead of
  // rendering empty and only discovering the LCP image's src after
  // hydration + a redundant client-side fetch. Falls back to undefined (the
  // old behavior — ProductDetailClient fetches it client-side itself) if the
  // server-side fetch fails, so a backend hiccup here can't take the page
  // down the way an unhandled throw during render would.
  const initialData = await getCachedProduct(id).catch(() => undefined);
  // Keying on id forces a clean remount per product instead of reusing the
  // instance across navigations — local state (quantity, selected cover
  // image/video, image-load tracking) would otherwise silently carry over
  // from the previous product.
  return <ProductDetailClient key={id} id={id} initialData={initialData} />;
}
