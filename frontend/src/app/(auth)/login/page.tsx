import GuestOnly from "@/components/auth/GuestOnly";
import LoginForm from "./LoginForm";

export default function Page() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}
