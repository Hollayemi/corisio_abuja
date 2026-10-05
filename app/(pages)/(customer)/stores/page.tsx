import type { Metadata } from "next";
import StoresExplorer from "@/app/components/stores/StoresExplorer";

export const metadata: Metadata = {
  title: "Stores near you",
  description: "See local stores on the map, preview what they sell, then visit the store page.",
};

export default function StoresPage() {
  return <StoresExplorer />;
}
