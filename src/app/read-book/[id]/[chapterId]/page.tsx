import ReadBook from "~/components/ReadBook";

const ReadBookChapterPage = async ({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) => {
  const { id, chapterId } = await params;

  return <ReadBook bookId={id} chapterId={chapterId} />;
};

export default ReadBookChapterPage; 