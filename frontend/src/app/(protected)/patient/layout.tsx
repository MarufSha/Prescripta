import PatientGuard from "@/components/auth/PatientGuard";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientGuard>{children}</PatientGuard>;
}
