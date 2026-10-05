import type { Metadata } from "next";
import StoreSetupClient from "./StoreSetupClient";

export const metadata: Metadata = {
  title: "Set Up Your Store",
  robots: { index: false, follow: false },
};

export default function StoreSetupPage() {
  return <StoreSetupClient />;
}
