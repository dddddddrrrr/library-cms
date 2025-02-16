import DepositContent from "~/components/DepositContent";

const DepositPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <DepositContent id={id} />;
};

export default DepositPage;
