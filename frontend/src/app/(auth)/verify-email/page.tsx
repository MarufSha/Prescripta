import VerifyEmailGate from "@/components/auth/VerifyEmailGate";
import VerifyEmailForm from "./VerifyEmailForm";

export default function Page() {
  return (
    <VerifyEmailGate>
      <VerifyEmailForm />
    </VerifyEmailGate>
  );
}
