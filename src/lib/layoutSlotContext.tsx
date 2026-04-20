import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface LayoutSlotContextValue {
  filterSlot: ReactNode;
  setFilterSlot: (node: ReactNode) => void;
}

const LayoutSlotContext = createContext<LayoutSlotContextValue>({
  filterSlot: null,
  setFilterSlot: () => {},
});

export function LayoutSlotProvider({ children }: { children: ReactNode }) {
  const [filterSlot, setFilterSlotState] = useState<ReactNode>(null);
  const setFilterSlot = useCallback((node: ReactNode) => {
    setFilterSlotState(node);
  }, []);

  return (
    <LayoutSlotContext.Provider value={{ filterSlot, setFilterSlot }}>
      {children}
    </LayoutSlotContext.Provider>
  );
}

export function useLayoutSlot() {
  return useContext(LayoutSlotContext);
}
