import type { Metadata } from "next";
import ServicePage from "@/app/components/Sections/ServicePage";

export const metadata: Metadata = {
  title: "Plan Your Freezer | Luxol Supermarket",
  description:
    "Tell us about your household and freezer and we'll help you plan what to stock and when.",
};

export default function FreezerPlannerPage() {
  return (
    <ServicePage
      bannerImage="/images/market.webp"
      intro={{
        heading: { lead: "Plan Your Freezer,", accent: "Stock Smarter" },
        description:
          "Not sure how much to buy? Tell us about your household and freezer, and we'll help you work out what you need. Get practical recommendations for groceries without the guesswork.",
        benefitsTitle: "Why use the Freezer Planner?",
        benefits: [
          "Recommendations based on your household",
          "Plan around your available freezer space",
          "Know how much to stock for the month",
          "Set reminders when it's time to restock",
        ],
        
        cta: { label: "Plan Your Freezer", href: "/freezer-planner/setup" },
        image: {
          src: "/images/full-basket.png",
          alt: "A shopping basket full of groceries next to a barcode scanner",
          style: "cutout",
        },
        imageSide: "right",
      }}
      howItWorks={{
        heading: { lead: "Plan Your Freezer", accent: "Stay Stocked" },
        description:
          "Tell us about your household and freezer, choose what you go through most, and decide how often you want to be restocked.",
        steps: [
          {
            title: "Set up your freezer profile",
            summary: "Tell us what you're working with.",
            detail:
              "Set up your freezer profile: household size, how often you cook, and how much space you've got, so we can plan how much groceries actually makes sense for you.",
          },
          {
            title: "Choose your proteins & portions",
            summary: "Pick what keeps your freezer full.",
            detail:
              "Choose the proteins, snacks and foodstuffs you go through most, then set how much of each you want on hand at any time.",
          },
          {
            title: "Set your restock schedule",
            summary: "Decide how often we top you up.",
            detail:
              "Pick a restock rhythm, maybe weekly, biweekly or monthly, and we'll build your deliveries around it.",
          },
          {
            title: "Sit back & stay stocked",
            summary: "We'll keep track from here.",
            detail:
              "We'll watch what's running low and deliver right on schedule, so your freezer never sits empty.",
          },
        ],
      }}
    />
  );
}
