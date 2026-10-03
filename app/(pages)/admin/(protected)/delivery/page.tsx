import type { Metadata } from "next";
import DeliveryClient from "./DeliveryClient";

export const metadata: Metadata = { title: "Delivery & Schedule" };

export default function AdminDeliveryPage() {
  return <DeliveryClient />;
}
