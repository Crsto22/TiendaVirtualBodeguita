import { Navbar } from "@/components/navbar";
import { MobileDock } from "@/components/mobile-dock";

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <Navbar />
            <MobileDock />

            <div className="container mx-auto px-4 py-6 md:py-12">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-darkblue mb-6 border-b pb-4">Política de Privacidad</h1>

                    <div className="space-y-6 text-gray-600 leading-relaxed font-body text-sm md:text-base">
                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">1. Recopilación de Datos</h2>
                            <p>
                                Para gestionar tu pedido de "Recojo en Tienda", recopilamos únicamente los datos esenciales para contactarte y verificar tu identidad al momento de la entrega:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Nombre completo.</li>
                                    <li>Número de teléfono (para coordinaciones o avisos de stock).</li>
                                    <li>Correo electrónico (para autenticación y resumen de compra).</li>
                                </ul>
                                <strong>No almacenamos direcciones de envío</strong> ya que no realizamos reparto a domicilio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">2. Uso de tu Información</h2>
                            <p>
                                Tus datos se utilizan exclusivamente para:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Notificarte cuando tu pedido esté listo para recoger.</li>
                                    <li>Contactarte en caso de que algún producto no esté disponible.</li>
                                    <li>Mejorar tu experiencia en la plataforma (historial de pedidos).</li>
                                </ul>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">3. Uso de Imagen</h2>
                            <p>
                                Utilizamos tu foto de perfil (proveída por Google/Autenticación) únicamente para personalizar la interfaz y facilitar la identificación visual rápida por parte del bodeguero al momento de entregarte el pedido.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">4. Seguridad</h2>
                            <p>
                                Tus datos están protegidos y no se comparten con terceros ni empresas de publicidad. El acceso a tu historial de compras es privado.
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
