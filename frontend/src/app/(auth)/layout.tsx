import Background from "../../components/Background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background>
      <div className="relative z-10 w-full max-w-md mx-auto">{children}</div>
    </Background>
  );
}
