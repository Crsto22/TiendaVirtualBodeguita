import { Product } from "@/types/product";
import { RotateCcw } from "lucide-react";

interface ProductReturnableBadgeProps {
  product: Product;
  className?: string;
}

export function ProductReturnableBadge({ product, className = "" }: ProductReturnableBadgeProps) {
  // Mostrar badge solo si el producto es retornable
  if (!product.retornable) {
    return null;
  }

  return (
    <div className={`absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded-lg shadow-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 ${className}`}>
      <RotateCcw className="size-3" />
      <span>Retornable</span>
    </div>
  );
}
