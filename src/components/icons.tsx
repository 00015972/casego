/** Shared stroke icons, sized by `size` and inheriting the current colour. */
function Icon({
  size = 20,
  strokeWidth = 1.7,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

export const CartIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </Icon>
);

export const UserIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const CloseIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={2.1}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const ChevronDownIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={2.2}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={2.2}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const ArrowRightIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={2.5}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Icon>
);

export const BoxIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={1.2}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Icon>
);

export const MenuIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={2}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

export const CheckIcon = (props: { size?: number }) => (
  <Icon {...props} strokeWidth={2.4}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

export const PinIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <path d="M21 10c0 6.5-9 12-9 12s-9-5.5-9-12a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const HomeIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10.5V20h13v-9.5" />
    <path d="M9.5 20v-6h5v6" />
  </Icon>
);

export const MapIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </Icon>
);

export const CrosshairIcon = (props: { size?: number }) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="7" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </Icon>
);
