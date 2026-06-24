import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const StarIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
  </svg>
);

export const ChevronLeft = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const ChevronRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const WifiIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 12.55a11 11 0 0 1 14 0M8.5 16.1a6 6 0 0 1 7 0M2 8.82a15 15 0 0 1 20 0" />
    <circle cx="12" cy="20" r="0.5" fill="currentColor" />
  </svg>
);
export const CarIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 17h14M6 17l-1-5 2-4h10l2 4-1 5M7 12h10" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="16.5" cy="17.5" r="1.5" />
  </svg>
);
export const CardIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
export const ChildIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v6m0 0l-3 4m3-4l3 4M8 10h8" />
  </svg>
);
export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M14 8.5h2.5V5.5H14c-1.93 0-3.5 1.57-3.5 3.5v2H8.5v3H10.5V21h3v-7H16l.5-3H13.5V9.5c0-.55.45-1 .5-1z" />
  </svg>
);
export const InstagramIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.6" fill="currentColor" />
  </svg>
);
export const WhatsappIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-5.6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c0-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1z" />
  </svg>
);
export const MailIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z" />
  </svg>
);
export const PinIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  wifi: WifiIcon,
  car: CarIcon,
  "credit-card": CardIcon,
  child: ChildIcon,
  check: CheckIcon,
};
