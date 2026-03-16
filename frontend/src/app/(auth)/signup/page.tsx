import GuestOnly from "@/components/auth/GuestOnly";
import SignUpForm from "./SignUpForm";

export default function Page() {
  return (
    <GuestOnly>
      <SignUpForm />
    </GuestOnly>
  );
}
