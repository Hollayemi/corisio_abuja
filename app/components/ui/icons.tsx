import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const BagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const BoltIcon = (p: IconProps) => (
  <Svg {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </Svg>
);

export const LinkedInIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Svg>
);

export const QualityIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </Svg>
);

export const DeliveryIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Svg>
);

export const PriceIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M15 9h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </Svg>
);

export const GemIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12l4 6-10 12L2 9z" />
    <path d="M11 3 8 9l4 12 4-12-3-6" />
    <path d="M2 9h20" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
  </Svg>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12.5 11 15.5 16 9" />
  </Svg>
);

export const AlertCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12.5" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
);

export const AlertTriangleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="11.5" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);


export const XCircleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </Svg>
);

/** Small four-dot cluster used for the "In Progress" order status. */
export const ProgressDotsIcon = (p: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...p}
  >
    <circle cx="6" cy="8" r="2" />
    <circle cx="14" cy="6" r="1.4" />
    <circle cx="18" cy="13" r="2" />
    <circle cx="9" cy="17" r="1.4" />
  </svg>
);


export const StarIcon = ({
  filled,
  ...p
}: IconProps & { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...p}
  >
    <polygon points="12 2.5 15.09 8.99 22.18 10.02 17.09 15.02 18.29 22.13 12 18.77 5.71 22.13 6.91 15.02 1.82 10.02 8.91 8.99 12 2.5" />
  </svg>
);

export const EmptyBasketIcon = (p: IconProps) => (
  <Svg strokeWidth={1.5} {...p}>
    <path d="M4 9h16l-1.2 9.6a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9L4 9z" />
    <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    <path d="M9 13v3" />
    <path d="M15 13v3" />
    <path d="M2.5 9h1.8" />
    <path d="M19.7 9h1.8" />
  </Svg>
);

export const TruckIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Svg>
);

export const FlexIcon = (p: IconProps) => (
  <Svg strokeWidth={1.6} {...p}>
    <path d="M12 4a8 8 0 1 1-6.93 4" />
    <polyline points="4 3.5 5 8 9.5 7.2" />
  </Svg>
);

export const EditIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Svg>
);

export const EyeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-7-11-7a20.5 20.5 0 0 1 4.22-5.36M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 7 11 7a20.6 20.6 0 0 1-2.68 3.87" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const InfoIcon2 = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16.5" />
    <circle cx="12" cy="7.75" r="0.5" fill="currentColor" stroke="none" />
  </Svg>
);

export const CameraIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
    <circle cx="12" cy="13" r="4" />
  </Svg>
);


export const ChickenIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3c2.5 0 4 1.8 4 4 0 1.6-.7 2.6-1.6 3.4" />
    <path d="M13 7c1.8-1 4-.6 5 .8" />
    <path d="M9.5 9.5c-3 0-5.5 2.6-5.5 6 0 4 3.3 7 7.7 7 4.2 0 7.3-2.7 7.3-6.3 0-2.2-1-3.8-2.6-4.9" />
    <path d="M8 13.2c1.2-1 3-1 4 .3" />
  </Svg>
);

export const CowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9c-1.5-.5-2.5-2-2-3.5C4 4 5.7 4 6.5 5" />
    <path d="M19 9c1.5-.5 2.5-2 2-3.5C20 4 18.3 4 17.5 5" />
    <path d="M6 10a6 6 0 0 1 12 0v2.5a6 6 0 0 1-2 4.5v1.5a1.5 1.5 0 0 1-3 0V18h-2v.5a1.5 1.5 0 0 1-3 0V17a6 6 0 0 1-2-4.5Z" />
    <circle cx="9.5" cy="10.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="10.5" r=".6" fill="currentColor" stroke="none" />
    <path d="M9.5 13.5c.8.7 2.2.7 3 0" />
  </Svg>
);

export const GoatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 6c-1.4-1.6-1.2-3.4.3-4.3C8.4 3 9 4.6 8.7 6.3" />
    <path d="M17 6c1.4-1.6 1.2-3.4-.3-4.3C15.6 3 15 4.6 15.3 6.3" />
    <path d="M7.5 9.5A5 5 0 0 1 12 7a5 5 0 0 1 4.5 2.5c1 1.7 1 3.8.2 6-.6 1.7-1.8 3-3.2 3.7v1.3a1 1 0 0 1-2 0v-1a6 6 0 0 1-2-.5v1.5a1 1 0 0 1-2 0v-2.3c-1-1-1.6-2.4-1.6-4 0-2.2.8-4 1.6-4.2Z" />
    <circle cx="10.5" cy="11.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11.5" r=".6" fill="currentColor" stroke="none" />
  </Svg>
);

export const MixedMeatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 13c0-3.9 2.9-7 7-8 .7 2 .5 4-1 5.5C11.8 12.3 13.5 13 15 13c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5" />
    <path d="M4 13a5 5 0 0 0 5 5" />
    <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
  </Svg>
);


export const socialIcons = {
  whatsapp: WhatsAppIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  mail: MailIcon,
} as const;

export const LocationPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const StoreIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M5 12v8h14v-8" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);