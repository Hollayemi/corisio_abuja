import { LocationPinIcon, PriceIcon, StoreIcon } from "../ui/icons";

const benefits = [
  {
    title: "Find it nearby",
    description:
      "Search for any product and see which stores close to you have it, right on the map.",
    Icon: LocationPinIcon,
  },
  {
    title: "Know before you go",
    description:
      "See prices, opening hours and distance up front, so every trip is worth making.",
    Icon: PriceIcon,
  },
  {
    title: "Support local stores",
    description:
      "Shop from trusted stores in your neighbourhood and keep your money in your community.",
    Icon: StoreIcon,
  },
];

export default function WhyShopWithUs() {
  return (
    <section
      aria-labelledby="why-shop-heading"
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-40 sm:px-6 sm:pb-14"
    >
      <div className="text-center">
        <h2
          id="why-shop-heading"
          className="text-xl font-semibold text-corisio-blue sm:text-2xl"
        >
          Why Use Corisio
        </h2>
        <span
          aria-hidden="true"
          className="mx-auto mt-2 block h-0.5 w-14 rounded-full bg-corisio-yellow"
        />
        <p className="mx-auto mt-3 max-w-[460px] text-sm text-neutral-600">
          Corisio connects you to physical stores around you, so what you need is never far away.
        </p>
      </div>

      <ul className="mt-8 grid gap-8 rounded-2xl bg-[#f8f1e6] px-6 py-8 sm:grid-cols-3 sm:justify-items-center sm:px-10 sm:py-10">
        {benefits.map(({ title, description, Icon }) => (
          <li key={title} className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center text-corisio-blue">
              <Icon className="size-8" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                {title}
              </h3>
              <p className="mt-1 max-w-[210px] text-xs leading-relaxed text-neutral-600 sm:text-sm">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}