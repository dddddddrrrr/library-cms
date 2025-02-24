import ReadBook from "~/components/ReadBook";

const ReadBookPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <ReadBook bookId={id} />;
};

export default ReadBookPage; 