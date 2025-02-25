import { type Metadata } from "next";
import { CommentsDataTable } from "~/components/comments/comments-data-table";

export const metadata: Metadata = {
  title: "评论管理",
  description: "查看用户的图书评论",
};

export default function CommentsPage() {
  return (
    <div className="container mx-auto py-10">
      <CommentsDataTable />
    </div>
  );
}
