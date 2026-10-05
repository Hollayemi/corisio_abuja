import type { Metadata } from "next";
import CustomerDetailClient from "./CustomerDetailClient";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetailClient id={id} />;
}
