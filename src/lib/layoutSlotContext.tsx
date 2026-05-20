import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface LayoutSlotContextValue {
  filterSlot: ReactNode;
  tabSlot: ReactNode;
  setFilterSlot: (node: ReactNode) => void;
  setTabSlot: (node: ReactNode) => void;
}

const LayoutSlotContext = createContext<LayoutSlotContextValue>({
  filterSlot: null,
  tabSlot: null,
  setFilterSlot: () => {},
  setTabSlot: () => {},
});

export function LayoutSlotProvider({ children }: { children: ReactNode }) {
  const [filterSlot, setFilterSlotState] = useState<ReactNode>(null);
  const [tabSlot, setTabSlotState] = useState<ReactNode>(null);
  const setFilterSlot = useCallback((node: ReactNode) => {
    setFilterSlotState(node);
  }, []);
  const setTabSlot = useCallback((node: ReactNode) => {
    setTabSlotState(node);
  }, []);

  return (
    <LayoutSlotContext.Provider value={{ filterSlot, tabSlot, setFilterSlot, setTabSlot }}>
      {children}
    </LayoutSlotContext.Provider>
  );
}

export function useLayoutSlot() {
  return useContext(LayoutSlotContext);
}
