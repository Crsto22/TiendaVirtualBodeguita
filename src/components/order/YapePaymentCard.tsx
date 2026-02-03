/**
 * YapePaymentCard Component
 * Tarjeta de pago con QR de Yape, visible solo cuando el pedido está listo/preparando
 */

import { Download } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

interface YapePaymentCardProps {
  estado: string;
  metodoPago: string;
  className?: string;
}

export function YapePaymentCard({
  estado,
  metodoPago,
  className = "",
}: YapePaymentCardProps) {
  // Solo mostrar si está lista/preparando y el método es Yape
  if (
    !((estado === "lista" || estado === "preparando") && metodoPago === "yape")
  ) {
    return null;
  }

  const handleDownloadQR = () => {
    const canvasId = `yape-qr-canvas-${className.includes("hidden") ? "desktop" : "mobile"}`;
    const originalCanvas = document.getElementById(
      canvasId
    ) as HTMLCanvasElement;
    if (!originalCanvas) return;

    // Crear canvas temporal de alta calidad para la "Tarjeta Yape"
    const cardCanvas = document.createElement("canvas");
    cardCanvas.width = 600;
    cardCanvas.height = 800;
    const ctx = cardCanvas.getContext("2d");
    if (!ctx) return;

    // 1. Fondo
    ctx.fillStyle = "#F3E8FF"; // Purple-50
    ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

    // 2. Contenedor Blanco Central
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(50, 50, 500, 700, 40);
    } else {
      ctx.rect(50, 50, 500, 700);
    }
    ctx.fill();

    // Sombra
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 20;
    ctx.fill();

    // 3. Texto Superior
    ctx.shadowColor = "transparent";
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#581c87"; // Purple-900
    ctx.textAlign = "center";
    ctx.fillText("Pago con Yape", cardCanvas.width / 2, 130);

    // 4. Nombre Destinatario
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = "#7c0f8b"; // Color Yape
    ctx.fillText("Yanet Mam*", cardCanvas.width / 2, 200);

    // 5. Dibujar QR
    const qrSize = 400;
    const qrX = (cardCanvas.width - qrSize) / 2;
    const qrY = 250;
    ctx.drawImage(originalCanvas, qrX, qrY, qrSize, qrSize);

    // 6. Texto Inferior
    ctx.font = "500 24px sans-serif";
    ctx.fillStyle = "#6b21a8"; // Purple-800
    ctx.fillText("Escanea para pagar", cardCanvas.width / 2, 700);

    // Descargar
    const pngUrl = cardCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "Yape_YanetMam.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("Tarjeta QR descargada");
  };

  return (
    <div
      className={`bg-purple-50 rounded-3xl shadow-lg border border-purple-100 p-6 flex flex-col md:flex-row items-center md:items-start md:justify-between text-center md:text-left transition-all animate-in fade-in slide-in-from-bottom-4 mb-6 ${className}`}
    >
      <div className="flex-1">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
            <Image
              src="/MetodoPago/Yape.png"
              alt="Yape"
              width={20}
              height={20}
              className="rounded-sm"
            />
          </div>
          <span className="font-bold text-purple-900">Pago con Yape</span>
        </div>

        <p className="text-sm font-medium text-purple-800 mb-1">
          Escanea para pagar a
        </p>
        <p className="text-2xl font-extrabold text-[#7c0f8b] mb-4">
          Yanet Mam*
        </p>

        <p className="hidden md:block text-sm text-purple-700 bg-purple-100/50 px-4 py-3 rounded-xl max-w-xs">
          {estado === "lista"
            ? "Muestra el comprobante al recoger tu pedido"
            : "Puedes ir adelantando tu pago mientras preparamos tu pedido"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 relative flex items-center justify-center shrink-0">
          <QRCodeCanvas
            id={`yape-qr-canvas-${className.includes("hidden") ? "desktop" : "mobile"}`}
            value="0002010102113932969cde686e395bc6b28b0c3b05efd87a5204561153036045802PE5906YAPERO6004Lima6304BA65"
            size={512}
            fgColor="#7c0f8b"
            level="H"
            style={{ width: "160px", height: "160px" }}
            imageSettings={{
              src: "/MetodoPago/Yape.png",
              height: 100,
              width: 100,
              excavate: true,
            }}
          />
          {/* Overlay visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm pointer-events-none">
            <Image
              src="/MetodoPago/Yape.png"
              alt="Yape"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 h-8 gap-2 bg-white"
          onClick={handleDownloadQR}
        >
          <Download className="size-3.5" />
          Descargar QR
        </Button>
      </div>

      <p className="md:hidden text-xs text-purple-700 bg-purple-100/50 px-3 py-2 rounded-lg w-full mt-4">
        {estado === "lista"
          ? "Muestra el comprobante al recoger tu pedido"
          : "Puedes ir adelantando tu pago mientras preparamos tu pedido"}
      </p>
    </div>
  );
}
