import DoctorInviteAcceptForm from "./DoctorInviteAcceptForm";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function DoctorInvitePage({ params }: PageProps) {
  const { token } = await params;
  return <DoctorInviteAcceptForm token={token} />;
}
