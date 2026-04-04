import { UserRole } from "@/store/authStore";

type UserLike = {
  role?: UserRole;
};

export const getDashboardRoute = (user: UserLike | null | undefined) => {
  switch (user?.role) {
    case "superadmin":
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor";
    case "patient":
    default:
      return "/patient";
  }
};
