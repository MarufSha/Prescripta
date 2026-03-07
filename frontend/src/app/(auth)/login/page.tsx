import GuestOnly from "@/app/components/auth/GuestOnly";
import LoginForm from "./LoginForm";

export default function Page() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}
