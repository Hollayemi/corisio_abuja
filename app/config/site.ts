export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "Corisio",
  logo: "/logo-hw.png",
  email: "support@corisio.com",
  phone: "+234 814 770 2684",
  address: "Abuja, Nigeria",

  promo: {
    text: "Discover stores and products around you.",
    linkLabel: "Explore nearby",
    href: "/stores",
  },

  socials: [
    {
      label: "WhatsApp",
      href: "https://wa.me/2348147702684",
      icon: "whatsapp",
    },
    {
      label: "Facebook",
      href: "#",
      icon: "facebook",
    },
    {
      label: "Instagram",
      href: "#",
      icon: "instagram",
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: "linkedin",
    },
    {
      label: "Email",
      href: "mailto:support@corisio.com",
      icon: "mail",
    },
  ] as const,

  /**
   * Main customer navigation
   */
  nav: [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "For Businesses", href: "/business" },
  ] satisfies NavItem[],


  categories: [
    { label: "All Categories", slug: "all" },
    { label: "Food & Groceries", slug: "food-groceries" },
    { label: "Restaurants", slug: "restaurants" },
    { label: "Fashion", slug: "fashion" },
    { label: "Beauty & Personal Care", slug: "beauty-personal-care" },
    { label: "Electronics", slug: "electronics" },
    { label: "Home & Living", slug: "home-living" },
    { label: "Health & Wellness", slug: "health-wellness" },
    { label: "Other", slug: "other" },
  ],

  /**
   * Footer navigation
   */
  footerColumns: [
    {
      title: "Discover",
      links: [
        { label: "Nearby Stores", href: "/stores" },
        { label: "Browse Products", href: "/products" },
        { label: "Categories", href: "/categories" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Delivery", href: "/delivery" },
      ],
    },

    {
      title: "For Businesses",
      links: [
        { label: "List Your Store", href: "/business" },
        { label: "How It Works", href: "/business/how-it-works" },
        { label: "Business Benefits", href: "/business/benefits" },
        { label: "Business Pricing", href: "/business/pricing" },
        { label: "Partner With Us", href: "/contact" },
      ],
    },

    {
      title: "Company",
      links: [
        { label: "About Corisio", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Help & Support", href: "/help" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    },
  ] satisfies { title: string; links: NavItem[] }[],
};