import AuthGuard from "../../components/auth/AuthGuard";
import Background from "../../components/Background";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background>
      <AuthGuard>{children}</AuthGuard>
    </Background>
  );
}
