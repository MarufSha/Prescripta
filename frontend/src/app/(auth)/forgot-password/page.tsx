import GuestOnly from "@/app/components/auth/GuestOnly";
import ForgotPasswordForm from "./ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <GuestOnly>
      <ForgotPasswordForm />
    </GuestOnly>
  );
};
export default ForgotPassword;
