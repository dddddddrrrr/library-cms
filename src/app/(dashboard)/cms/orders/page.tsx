import { type Metadata } from "next";
import { OrdersDataTable } from "~/components/orders/orders-data-table";

export const metadata: Metadata = {
  title: "订单管理",
  description: "查看系统中的所有订单",
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <OrdersDataTable />
    </div>
  );
}
