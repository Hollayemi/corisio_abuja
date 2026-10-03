import type { Metadata } from "next";
import ServicePage from "@/app/components/Sections/ServicePage";

export const metadata: Metadata = {
  title: "Build Your Meat Box | Luxol Supermarket",
  description:
    "Choose your meats, set your quantities and get your Meat Box delivered once or on a schedule.",
};

export default function MeatBoxPage() {
  return (
    <ServicePage
      bannerImage="/images/freezer-planner.webp"
      intro={{
        heading: { lead: "Build Your Meat Box,", accent: "Your Meat, Your Way" },
        description:
          "Stock up on the cuts your household loves, exactly the way you want them. Choose your meats, set your quantities, and decide whether you want it once or delivered regularly.",
        benefitsTitle: "Why choose the Meat Box?",
        benefits: [
          "Customise your box to your needs",
          "Choose from quality meat cuts",
          "One-time or recurring delivery options",
          "Convenient delivery or store pickup",
        ],
        // Placeholder route: point this at your meat box builder
        cta: { label: "Build Your Meat Box", href: "/meat-box/build" },
        image: {
          src: "/images/meat-box.webp",
          alt: "A Luxol meat box with fresh cuts of beef, bacon and sausages",
          style: "card",
        },
        imageSide: "left",
      }}
      howItWorks={{
        heading: { lead: "Build Your Meat Box", accent: "Your Way" },
        description:
          "Choose the proteins you want, pick your preferred cuts and quantities, add your groceries, and decide whether you want it once or delivered regularly.",
        steps: [
          {
            title: "Create your account",
            summary: "Start with your details.",
            detail:
              "Create your Luxol account so we can save your preferences, delivery details and Meat Box orders for an easier experience next time.",
          },
          {
            title: "Build your Meat Box",
            summary: "Choose exactly what you want.",
            detail:
              "Select the proteins you want in your box, then choose your preferred cuts, portions and quantities.",
          },
          {
            title: "Add your extras & Schedules",
            summary: "Complete your box with more of what you need.",
            detail:
              "Add the add-ons like assorted meats and the likes alongside your meat.",
          },
          {
            title: "Review, Pay & Relax",
            summary: "We'll take it from here.",
            detail:
              "Review everything in your Meat Box, confirm your delivery details and complete your payment.",
          },
        ],
      }}
    />
  );
}
