import { type Metadata } from "next";
import { ViewsDataTable } from "~/components/views/views-data-table";

export const metadata: Metadata = {
  title: "浏览记录",
  description: "查看用户的图书浏览记录",
};

export default function ViewsPage() {
  return (
    <div className="container mx-auto py-10">
      <ViewsDataTable />
    </div>
  );
}
