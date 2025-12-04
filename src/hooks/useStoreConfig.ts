import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/firebase/firebase";

interface StoreConfig {
  hacer_pedidos: boolean;
  tienda_abierta: boolean;
}

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const configRef = ref(realtimeDb, "configuracion");

    const unsubscribe = onValue(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setConfig({
            hacer_pedidos: data.hacer_pedidos ?? false,
            tienda_abierta: data.tienda_abierta ?? false,
          });
          setError(null);
        } else {
          setConfig(null);
          setError("No se encontró la configuración");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error al leer configuración:", err);
        setError("Error al conectar con Firebase");
        setLoading(false);
      }
    );

    // Cleanup: detach listener cuando el componente se desmonte
    return () => {
      off(configRef);
    };
  }, []);

  return {
    config,
    loading,
    error,
    tiendaAbierta: config?.tienda_abierta ?? false,
    hacerPedidos: config?.hacer_pedidos ?? false,
  };
}
