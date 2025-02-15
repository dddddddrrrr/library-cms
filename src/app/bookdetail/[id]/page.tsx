import BookDetail from "~/components/BookDetail";

const BookDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <BookDetail id={id} />;
};

export default BookDetailPage;
