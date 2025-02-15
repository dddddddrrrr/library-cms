"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Sparkles, Gift, Zap } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface RechargeOption {
  amount: number;
  bonus: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const rechargeOptions: RechargeOption[] = [
  {
    amount: 100,
    bonus: 10,
    icon: <Zap className="h-5 w-5 text-blue-500" />,
    title: "基础充值",
    description: "适合轻度阅读用户",
    features: ["赠送10元阅读金", "可购买任意图书", "无使用限制"],
  },
  {
    amount: 200,
    bonus: 30,
    icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
    title: "推荐充值",
    description: "最受欢迎的选择",
    features: ["赠送30元阅读金", "享受会员价格", "专属客服服务"],
    recommended: true,
  },
  {
    amount: 500,
    bonus: 100,
    icon: <Gift className="h-5 w-5 text-red-500" />,
    title: "超值充值",
    description: "重度阅读者的明智之选",
    features: ["赠送100元阅读金", "专属VIP标识", "享受特别折扣", "优先购买权"],
  },
];

interface RechargeDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function RechargeDialog({ isOpen, setIsOpen }: RechargeDialogProps) {
  const [selectedOption, setSelectedOption] = useState<RechargeOption | null>(null);

  const { mutateAsync: createRechargeSession } =
    api.payment.createRechargeCheckoutSession.useMutation();

  const handleRecharge = async () => {
    if (!selectedOption) {
      toast.error("请选择充值金额");
      return;
    }

    try {
      const result = await createRechargeSession({
        amount: selectedOption.amount + selectedOption.bonus,
      });

      if (result.sessionId) {
        window.location.href = `/payment/checkout?session_id=${result.sessionId}`;
      }
    } catch (error) {
      toast.error("创建支付会话失败");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            账户充值
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {rechargeOptions.map((option) => (
            <div
              key={option.amount}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50 hover:shadow-lg ${
                selectedOption?.amount === option.amount
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } ${option.recommended ? "ring-2 ring-primary ring-offset-2" : ""}`}
              onClick={() => setSelectedOption(option)}
            >
              {option.recommended && (
                <Badge
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                  variant="default"
                >
                  推荐
                </Badge>
              )}

              <div className="mb-4 flex items-center justify-center">{option.icon}</div>

              <h3 className="mb-1 text-center text-lg font-semibold">
                {option.title}
              </h3>
              <p className="mb-2 text-center text-sm text-muted-foreground">
                {option.description}
              </p>

              <div className="mb-4 text-center">
                <span className="text-2xl font-bold">¥{option.amount}</span>
                {option.bonus > 0 && (
                  <span className="ml-2 text-sm text-primary">
                    送{option.bonus}元
                  </span>
                )}
              </div>

              <ul className="space-y-2 text-sm">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleRecharge} disabled={!selectedOption}>
            立即充值
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 