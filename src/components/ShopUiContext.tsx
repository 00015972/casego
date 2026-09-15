"use client";

import { createContext, useContext } from "react";

export interface ShopUiValue {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openCatalog: () => void;
  openCart: () => void;
}

export const ShopUiContext = createContext<ShopUiValue | null>(null);

export function useShopUi() {
  const value = useContext(ShopUiContext);
  if (!value) throw new Error("useShopUi must be used inside StorefrontShell");
  return value;
}
