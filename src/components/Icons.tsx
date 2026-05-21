import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 30,
  height: 30,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="7" r="3.2" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

export const SettingsIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10.5V20h12v-9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6" />
    <line x1="15.5" y1="15.5" x2="20" y2="20" />
  </svg>
);

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const HeartIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </svg>
);

export const CommentIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 5h16v11H9l-5 4V5z" />
  </svg>
);

export const ShareIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="18" cy="6" r="2.4" />
    <circle cx="18" cy="18" r="2.4" />
    <line x1="8.2" y1="11" x2="15.8" y2="7" />
    <line x1="8.2" y1="13" x2="15.8" y2="17" />
  </svg>
);

export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 4l2.4 5 5.6.5-4.3 3.7 1.4 5.4L12 21l-5.1 2.6 1.4-5.4L4 14.5l5.6-.5z" />
  </svg>
);

export const ChevronIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
