"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import { type Book } from "@prisma/client";

interface PurchaseDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  book: Book & {
    category: {
      name: string;
    };
  };
}

export default function PurchaseDialog({
  isOpen,
  setIsOpen,
  book,
}: PurchaseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: createBookCheckoutSession } =
    api.payment.createBookCheckoutSession.useMutation();

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
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
          console.error("Stripe failed to initialize.");
          toast.error("支付初始化失败");
        }
      } else {
        console.error("No session ID returned from server");
        toast.error("创建支付会话失败");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("创建支付会话失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">确认购买</DialogTitle>
          <DialogDescription>请确认以下购买信息</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* 图书信息 */}
          <div className="flex gap-4">
            <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-sm">
              <Image
                src={book.cover ?? ""}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <p className="text-sm text-muted-foreground">
                分类：{book.category.name}
              </p>
            </div>
          </div>

          <Separator />

          {/* 价格信息 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品金额</span>
              <span>¥{book.price.toString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>实付金额</span>
              <span className="text-lg">¥{book.price.toString()}</span>
            </div>
          </div>

          <Separator />

          {/* 购买按钮 */}
          <div className="flex justify-end gap-3">
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
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  确认购买
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 