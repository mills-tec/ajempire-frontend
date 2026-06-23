import { getProduct } from "@/lib/api";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const data = await getProduct(id);
    const product = data?.message?.product;

    if (!product) {
      return {
        title: "Product Not Found - AJ Empire",
      };
    }

    const image = product.cover_image || product.images?.[0] || "/icon-512.png";
    console.log("Product cover img:", product.cover_image);

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
  return <ProductDetailClient id={id} />;
}
