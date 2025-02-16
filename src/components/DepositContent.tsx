"use client";

import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { formatDate } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";

// 充值状态映射
const statusMap = {
  PENDING: { label: "待支付", color: "bg-yellow-500/10 text-yellow-500" },
  SUCCESS: { label: "支付成功", color: "bg-green-500/10 text-green-500" },
  FAILED: { label: "支付失败", color: "bg-red-500/10 text-red-500" },
  CANCELLED: { label: "已取消", color: "bg-gray-500/10 text-gray-500" },
};

// 支付渠道映射
const channelMap = {
  WECHAT: "微信支付",
  ALIPAY: "支付宝",
  BANK_CARD: "银行卡",
};

const DepositContent = ({ id }: { id: string }) => {
  const { data: recharges, isLoading } = api.users.getRechargeHistory.useQuery(
    { userId: id },
    {
      refetchInterval: 5000, // 每5秒刷新一次，以更新支付状态
    },
  );

  return (
    <div className="min-h-screen space-y-8 bg-muted/30 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">充值记录</h1>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </motion.div>
        ) : !recharges?.length ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[40vh] flex-col items-center justify-center gap-4 text-muted-foreground"
          >
            <Wallet className="h-12 w-12" />
            <p className="text-lg">暂无充值记录</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>充值金额</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recharges.map((recharge, index) => (
                  <motion.tr
                    key={recharge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell className="font-medium">
                      ¥{recharge.amount.toString()}
                    </TableCell>
                    <TableCell>{channelMap[recharge.channel]}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusMap[recharge.status].color}
                      >
                        {statusMap[recharge.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(recharge.createdAt)}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepositContent;
