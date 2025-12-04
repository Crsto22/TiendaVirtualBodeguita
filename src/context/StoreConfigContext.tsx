"use client";

import React, { createContext, useContext } from "react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

interface StoreConfigContextType {
  tiendaAbierta: boolean;
  hacerPedidos: boolean;
  loading: boolean;
  error: string | null;
}

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const { tiendaAbierta, hacerPedidos, loading, error } = useStoreConfig();

  return (
    <StoreConfigContext.Provider value={{ tiendaAbierta, hacerPedidos, loading, error }}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfigContext() {
  const context = useContext(StoreConfigContext);
  if (context === undefined) {
    throw new Error("useStoreConfigContext debe usarse dentro de StoreConfigProvider");
  }
  return context;
}
