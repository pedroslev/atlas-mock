import type { Metadata } from "next";
import { PadConsole } from "@/components/pad/pad-console";

export const metadata: Metadata = {
  title: "Hermes - Mitrol",
  description: "Pad del agente de Atlas — atención de interacciones telefónicas.",
};

export default function PadPage() {
  return <PadConsole />;
}
