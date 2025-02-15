import UserCenter from "~/components/UserCenter";

const UserCenterPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <UserCenter id={id} />;
};

export default UserCenterPage;
