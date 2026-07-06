import ProductCard from "@/app/components/ProductCard";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Product } from "@/lib/types";
import { memo } from "react";

function ProductItem({ product, index }: { product: Product, index: number }) {
    return (
        <Tooltip key={product._id}>
            <TooltipTrigger asChild>
                <ProductCard product={product} index={index} />
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
                <p>{product.name}</p>
            </TooltipContent>
        </Tooltip>
    )
}

export default memo(ProductItem);
