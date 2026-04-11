import Background from "../../components/Background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background>
      <div className="relative z-10 h-screen w-screen overflow-hidden">
        {children}
      </div>
    </Background>
  );
}
