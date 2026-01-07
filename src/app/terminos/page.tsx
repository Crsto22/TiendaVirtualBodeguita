import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio - Vanesa Bodeguita",
  description: "Lee los términos y condiciones de servicio de Vanesa Bodeguita. Modalidad de compra, pagos y políticas de la tienda.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/terminos",
  },
};

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />
            <MobileDock />

            <div className="container mx-auto px-4 py-6 md:py-12">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-darkblue mb-6 border-b pb-4">Términos de Servicio</h1>

                    <div className="space-y-6 text-gray-600 leading-relaxed font-body text-sm md:text-base">
                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">1. Modalidad de Compra</h2>
                            <p>
                                Este servicio funciona exclusivamente para <strong>reservar tus productos y recogerlos en tienda</strong>.
                                No realizamos envíos a domicilio. Tú armas tu pedido en la web y nosotros lo tenemos listo para cuando vengas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">2. Pagos y Cobros (Cero Crédito)</h2>
                            <p>
                                <strong>No se entregan productos "al fiado" ni a crédito.</strong>
                                <br />
                                Para retirar tu pedido, el pago debe ser completado en su totalidad mediante:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Efectivo:</strong> Pago contra entrega exacto o con vuelto confirmado.</li>
                                    <li><strong>Billetera Digital (Yape):</strong> Transferencia inmediata al momento del recojo.</li>
                                </ul>
                                Sin el pago completo, no se procederá a la entrega de la mercadería.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">3. Precios y Montos Mínimos</h2>
                            <p>
                                Los precios mostrados en la plataforma son referenciales. El monto final se confirmará al momento del pago.
                                <br />
                                <strong>Pedido Mínimo:</strong> Para pedidos que contienen exclusivamente productos con precio fijo, el monto mínimo de compra es de <strong>S/ 1.00</strong>.
                                <br />
                                esta restricción no aplica si tu carrito incluye productos "Por Consultar" (peso variable o stock por confirmar).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">4. Venta por Peso</h2>
                            <p>
                                Para productos vendidos a granel (frutas, verduras, carnes, etc.), el <strong>peso mínimo de compra es de 100 gramos (0.1 kg)</strong>.
                                <br />
                                El precio final de estos productos puede variar ligeramente según el peso exacto pesado en balanza al momento de preparar tu pedido.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">5. Tiempo de Recojo</h2>
                            <p>
                                Tu pedido se mantendrá reservado por un máximo de <strong>3 horas</strong> desde la confirmación.
                                Si no se recoge y paga en ese lapso, el pedido será anulado y los productos regresarán a la venta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">6. Productos Retornables</h2>
                            <p>
                                Si llevas bebidas retornables, se requiere entregar el envase vacío al recoger.
                                <br />
                                En caso de no tener envase:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Clientes Generales:</strong> Deberán abonar el valor del envase adicional.</li>
                                    <li><strong>Clientes Habituales:</strong> Podrán solicitar el registro del envase pendiente en su cuenta (sujeto a evaluación en caja).</li>
                                </ul>
                            </p>
                        </section>

                        <div className="pt-4 text-sm text-gray-500 border-t mt-8">
                            Última actualización: {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
