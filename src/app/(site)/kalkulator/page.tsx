import type { Metadata } from "next";
import KalkulatorClient from "./KalkulatorClient";

export const metadata: Metadata = {
  title: "Kalkulator",
  description: "Kalkulator Win Rate dan Magic Wheel Mobile Legends gratis dari BFSTORE.",
};

export default function KalkulatorPage() {
  return <KalkulatorClient />;
}
