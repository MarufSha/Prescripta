import DoctorGuard from "@/components/auth/DoctorGuard";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorGuard>{children}</DoctorGuard>;
}