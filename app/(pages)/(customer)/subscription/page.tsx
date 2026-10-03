import type { Metadata } from "next";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import MembershipPlans from "./components/MembershipPlans";
import Flexibility from "./components/Flexibility";

export const metadata: Metadata = {
  title: "Subscription | Luxol Supermarket",
  description:
    "Get quality meat and protein delivered to your door every week, based on a plan that fits your household or business.",
};

export default function SubscriptionPage() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <MembershipPlans />
      <Flexibility />
    </div>
  );
}
