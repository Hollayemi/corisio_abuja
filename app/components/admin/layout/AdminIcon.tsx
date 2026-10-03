import type { CSSProperties, SVGProps } from "react";

const V = "/icons/vuesax/linear/vuesax/linear";
const H = "/icons/Huge-icon";

/** Icons that are files in /public/icons. Drawn as a mask, so they take the text colour. */
const FILE_ICONS = {
  overview: `${V}/home-2.svg`,
  orders: `${V}/bag.svg`,
  customers: `${V}/user-search.svg`,
  inventory: `${V}/shop.svg`,
  delivery: `${V}/calendar.svg`,
  membership: `${V}/crown.svg`,
  settings: `${V}/setting.svg`,
  logout: `${V}/logout.svg`,
  external: `${V}/export.svg`,
  search: `${V}/search-normal.svg`,
  meatBox: `${H}/shipping and delivery/outline/package box 07.svg`,
  freezerPlanner: `${V}/shop.svg`,
  bell: `${H}/interface/outline/notification 03.svg`,
  export: `${V}/export.svg`,
  arrowLeft: `${V}/arrow-left.svg`,
  calendar: `${V}/calendar.svg`,
} as const;

type SvgProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
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

/** The few icons that aren't in /public/icons yet, drawn to match their style. */
const INLINE_ICONS = {
  promotions: (p: SvgProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M9 15l6-6" />
      <circle cx="9.3" cy="9.3" r="1" />
      <circle cx="14.7" cy="14.7" r="1" />
    </Svg>
  ),
  analytics: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M20.5 13.5A8.75 8.75 0 1 1 10.5 3.5" />
      <path d="M13.5 3.6a8.75 8.75 0 0 1 6.9 6.9h-6.9z" />
    </Svg>
  ),
  collapse: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M3 12h12" />
      <path d="M7 8l-4 4 4 4" />
      <circle cx="19.5" cy="12" r="1.75" />
    </Svg>
  ),
  chevronDown: (p: SvgProps) => (
    <Svg {...p}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  ),
  menu: (p: SvgProps) => (
    <Svg {...p}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Svg>
  ),
  close: (p: SvgProps) => (
    <Svg {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  ),
  moreVertical: (p: SvgProps) => (
    <Svg {...p} fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </Svg>
  ),
  plus: (p: SvgProps) => (
    <Svg {...p}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  ),
  chevronLeft: (p: SvgProps) => (
    <Svg {...p}>
      <polyline points="15 18 9 12 15 6" />
    </Svg>
  ),
  chevronRight: (p: SvgProps) => (
    <Svg {...p}>
      <polyline points="9 18 15 12 9 6" />
    </Svg>
  ),
  upload: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M12 15V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  ),
  edit: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  ),
  trash: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M4 6h16" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Svg>
  ),
  filter: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </Svg>
  ),
  package: (p: SvgProps) => (
    <Svg {...p}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </Svg>
  ),
  pause: (p: SvgProps) => (
    <Svg {...p}>
      <line x1="9" y1="5" x2="9" y2="19" />
      <line x1="15" y1="5" x2="15" y2="19" />
    </Svg>
  ),
  play: (p: SvgProps) => (
    <Svg {...p} fill="currentColor" stroke="none">
      <path d="M7 4l13 8-13 8z" />
    </Svg>
  ),
} as const;

export type AdminIconName =
  | keyof typeof FILE_ICONS
  | keyof typeof INLINE_ICONS;

export default function AdminIcon({
  name,
  className = "size-[18px]",
}: {
  name: AdminIconName;
  className?: string;
}) {
  if (name in INLINE_ICONS) {
    const Icon = INLINE_ICONS[name as keyof typeof INLINE_ICONS];
    return <Icon className={className} />;
  }

  const url = `url("${encodeURI(FILE_ICONS[name as keyof typeof FILE_ICONS])}")`;
  const style: CSSProperties = {
    maskImage: url,
    WebkitMaskImage: url,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain",
  };

  return (
    <span
      aria-hidden="true"
      style={style}
      className={`inline-block bg-current ${className}`}
    />
  );
}
