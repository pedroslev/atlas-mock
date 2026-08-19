"use client";

import { useEffect, useState } from "react";

// Copia chica del useIsMac real (pad-state.tsx) — se duplica a propósito
// para no acoplar este mock al PadStateProvider del pad real.
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    const p = navigator.platform || navigator.userAgent || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(p));
  }, []);
  return isMac;
}
