"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Loader2, ShoppingCart, CreditCard, Wallet } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import { type Book } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PurchaseDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  book: Book & {
    category: {
      name: string;
    };
  };
}

type PaymentMethod = "BALANCE" | "STRIPE";

export default function PurchaseDialog({
  isOpen,
  setIsOpen,
  book,
}: PurchaseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BALANCE");
  const { data: balance } = api.users.fetchUserBalance.useQuery();
  const utils = api.useUtils();

  const { mutateAsync: createBookCheckoutSession } =
    api.payment.createBookCheckoutSession.useMutation();

  const { mutateAsync: purchaseWithBalance } =
    api.payment.purchaseWithBalance.useMutation();

  const handlePurchase = useCallback(async () => {
    if (!paymentMethod) return;

    try {
      setIsLoading(true);

      if (paymentMethod === "BALANCE") {
        // 检查余额是否足够
        if (Number(balance) < Number(book.price)) {
          toast.error("余额不足，请先充值");
          return;
        }

        // 使用余额支付
        const result = await purchaseWithBalance({
          bookId: book.id,
          amount: Number(book.price),
        });

        if (result.success) {
          toast.success("购买成功");
          setIsOpen(false);
          void utils.users.fetchUserBalance.invalidate();
        }
      } else {
        // Stripe 支付
        const result = await createBookCheckoutSession({
          book: {
            id: book.id,
            title: book.title,
            price: Number(book.price),
            cover: book.cover ?? "",
          },
        });

        if (result.sessionId) {
          const stripe = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
          );
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: result.sessionId });
          } else {
            toast.error("支付初始化失败");
          }
        } else {
          toast.error("创建支付会话失败");
        }
      }
    } catch (error) {
      toast.error("购买失败");
    } finally {
      setIsLoading(false);
    }
  }, [
    paymentMethod,
    balance,
    book,
    purchaseWithBalance,
    createBookCheckoutSession,
    setIsOpen,
    utils,
  ]);

  // 使用 useCallback 包装 paymentMethod 变更处理函数
  const handlePaymentMethodChange = useCallback((value: string) => {
    setPaymentMethod(value as PaymentMethod);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">确认购买</DialogTitle>
          <DialogDescription>请确认以下购买信息</DialogDescription>
        </DialogHeader>

        <motion.div
          className="mt-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 图书信息 */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-sm">
              <Image
                src={book.cover ?? ""}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <motion.div
              className="flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-medium">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <p className="text-sm text-muted-foreground">
                分类：{book.category.name}
              </p>
            </motion.div>
          </motion.div>

          <Separator />

          {/* 价格信息 */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品金额</span>
              <span>¥{book.price.toString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>实付金额</span>
              <span className="text-lg">¥{book.price.toString()}</span>
            </div>
          </motion.div>

          <Separator />

          {/* 支付方式选择 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RadioGroup
              value={paymentMethod}
              onValueChange={handlePaymentMethodChange}
              className="space-y-2"
            >
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RadioGroupItem
                  value="BALANCE"
                  id="balance"
                  disabled={!balance || Number(balance) < Number(book.price)}
                />
                <Label
                  htmlFor="balance"
                  className={cn(
                    "flex items-center gap-2",
                    (!balance || Number(balance) < Number(book.price)) &&
                      "text-muted-foreground",
                  )}
                >
                  <Wallet className="h-4 w-4" />
                  余额支付 (当前余额: ¥{balance ?? "0.00"})
                </Label>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RadioGroupItem value="STRIPE" id="stripe" />
                <Label htmlFor="stripe" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  在线支付
                </Label>
              </motion.div>
            </RadioGroup>
          </motion.div>

          {/* 按钮组 */}
          <motion.div
            className="flex justify-end gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中
                </>
              ) : (
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  确认购买
                </motion.div>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
