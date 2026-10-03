import type { Metadata } from "next";
import OverviewClient from "./OverviewClient";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return <OverviewClient />;
}
