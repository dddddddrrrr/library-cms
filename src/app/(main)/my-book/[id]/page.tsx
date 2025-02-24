import MyBook from "~/components/MyBook";

const MyBookPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <MyBook id={id} />;
};

export default MyBookPage;
