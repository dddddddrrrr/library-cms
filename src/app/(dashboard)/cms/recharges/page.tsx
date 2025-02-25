import { type Metadata } from "next";
import { RechargesDataTable } from "~/components/recharges/recharges-data-table";

export const metadata: Metadata = {
  title: "充值记录",
  description: "查看系统中的所有充值记录",
};

export default function RechargesPage() {
  return (
    <div className="container mx-auto py-10">
      <RechargesDataTable />
    </div>
  );
}
