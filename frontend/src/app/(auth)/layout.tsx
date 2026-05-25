import Background from "../../components/Background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background>
      <div className="relative z-10 overflow-x-hidden lg:h-screen lg:w-screen lg:overflow-hidden">
        {children}
      </div>
    </Background>
  );
}
