import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLayoutSlot } from "../../lib/layoutSlotContext";

interface LayoutTabsSlotProps {
  children: ReactNode;
}

export default function LayoutTabsSlot({ children }: LayoutTabsSlotProps) {
  const { setTabSlot } = useLayoutSlot();

  useEffect(() => {
    setTabSlot(children);
    return () => setTabSlot(null);
  }, [children, setTabSlot]);

  return null;
}
