"use client";
import { getProductsByCategory } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import ProductCard from "../../components/ProductCard";
import Spinner from "../../components/Spinner";

function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const { data, isLoading } = useQuery({
    queryKey: [category + "-feed"],
    queryFn: () => getProductsByCategory(category),
  });
  return (
    <div className="px-[20px] lg:px-10">
      <h1 className="pt-10">Home {" > " + category}</h1>
      <div className="grid grid-cols-2 lg:flex justify-start flex-wrap gap-4  lg:gap-6 mx-auto mt-8">
        {isLoading && <Spinner />}
        {data?.message &&
          data.message.products.map((product) => (
            <Tooltip key={product._id}>
              <TooltipTrigger>
                <div>
                  <ProductCard product={product} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p>{product.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
      </div>
    </div>
  );
}

export default CategoryPage;
