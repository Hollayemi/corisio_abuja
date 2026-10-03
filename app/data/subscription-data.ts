/**
 * Static copy for the /subscription (membership) page.
 *
 * Plans, proteins and delivery options are NOT here: they come from the API
 * (redux/slices/membershipApi.ts) so they always match what staff set up on
 * the admin Membership page.
 */

export type HowItWorksStep = {
  title: string;
  description: string;
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Choose your plan",
    description:
      "Pick the protein plan that fits your household or business and select your preferred delivery details.",
  },
  {
    title: "Subscribe & pay",
    description:
      "Complete your subscription and set up your payment method for your recurring monthly payment.",
  },
  {
    title: "We prepare your supply",
    description:
      "Luxol prepares your weekly protein allocation according to your selected plan.",
  },
  {
    title: "Receive it every week",
    description:
      "Your protein is delivered on schedule, so you don't have to remember to reorder every week.",
  },
];

export const FLEXIBILITY_POINTS: string[] = [
  "Pause your membership when you need a break.",
  "Skip an upcoming delivery when you don't need one.",
  "Resume when you're ready.",
  "Upgrade or downgrade as your needs change.",
  "Cancel whenever you choose.",
];

const priceFmt = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 30000 -> "₦30,000" */
export function formatPlanPrice(amount: number): string {
  return priceFmt.format(amount);
}

/** "week" -> "weekly": for "Recurring monthly subscription". */
export const INTERVAL_ADJECTIVE = { week: "weekly", month: "monthly", year: "yearly" } as const;

/** "month" -> "month": for "/ month" and "one month from today". */
export const INTERVAL_UNIT = { week: "week", month: "month", year: "year" } as const;
