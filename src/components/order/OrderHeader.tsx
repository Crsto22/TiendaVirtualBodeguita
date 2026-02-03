/**
 * OrderHeader Component
 * Barra superior sticky con navegación, logo y cronómetro
 */

import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrderHeaderProps {
  numeroOrden: string;
  timeRemaining: number | null;
  minutes: number;
  seconds: number;
  showTimer: boolean;
}

export function OrderHeader({
  numeroOrden,
  timeRemaining,
  minutes,
  seconds,
  showTimer,
}: OrderHeaderProps) {
  const router = useRouter();
  const isUrgent = timeRemaining !== null && timeRemaining < 60000;

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/inicio")}
            className="rounded-full hover:bg-gray-100 -ml-2 text-gray-600"
            size="sm"
          >
            <ArrowLeft className="size-5 mr-1" />
            <span className="hidden sm:inline">Volver</span>
          </Button>

          <Link
            href="/inicio"
            className="relative size-9 rounded-full overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/Logo.png"
              alt="Bodeguita Logo"
              fill
              className="object-cover"
              priority
            />
          </Link>
        </div>

        {/* Cronómetro Central */}
        {showTimer && timeRemaining !== null && timeRemaining > 0 && (
          <div
            className={`
              absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-300 z-20
              ${
                isUrgent
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <Clock
              className={`size-3.5 sm:size-4 ${
                isUrgent ? "animate-pulse text-red-500" : "text-gray-400"
              }`}
            />
            <span className="text-sm font-semibold tabular-nums tracking-wide">
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </span>
          </div>
        )}

        <div className="flex flex-col items-end sm:items-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            Orden #
          </span>
          <span className="text-sm font-bold text-gray-900 font-mono">
            {numeroOrden}
          </span>
        </div>
      </div>
    </div>
  );
}
