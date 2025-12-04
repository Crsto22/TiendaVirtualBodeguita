import { Product } from "@/types/product";

interface ProductNewBadgeProps {
  product: Product;
  className?: string;
}

export function ProductNewBadge({ product, className = "" }: ProductNewBadgeProps) {
  const createdDate = new Date(product.fecha_creacion);
  const now = new Date();
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  // Mostrar badge solo si el producto tiene menos de 7 días
  if (daysDiff > 7) {
    return null;
  }

  return (
    <div className={`absolute top-2 left-2 bg-darkblue text-white px-2 py-1 rounded-lg shadow-lg text-[10px] sm:text-xs font-bold ${className}`}>
      Nuevo
    </div>
  );
}
