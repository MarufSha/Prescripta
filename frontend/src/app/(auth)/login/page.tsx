import GuestOnly from "@/components/auth/GuestOnly";
import LoginForm from "./LoginForm";

export default function Page() {
  return (
    <GuestOnly>
      <div className="h-screen w-screen overflow-hidden">
        <LoginForm />
      </div>
    </GuestOnly>
  );
}
