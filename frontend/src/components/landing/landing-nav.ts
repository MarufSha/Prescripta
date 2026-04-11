export type LandingNavItem = {
  id: number;
  title: string;
  sectionId: string;
  offset?: number;
};

export const LANDING_NAV_ITEMS: LandingNavItem[] = [
  {
    id: 1,
    title: "Platform",
    sectionId: "features",
  },
  {
    id: 2,
    title: "How It Works",
    sectionId: "how-it-works",
  },
  {
    id: 3,
    title: "Roles",
    sectionId: "roles",
  },
];