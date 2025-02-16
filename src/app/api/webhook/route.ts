import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "~/server/db";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20.acacia",
      appInfo: {
        name: "nextjs-with-stripe-typescript-demo",
        url: "https://nextjs-with-stripe-typescript-demo.vercel.app",
      },
    });
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature")!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
  ];

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          console.log(
            "Handling checkout.session.completed event for session ID:",
            session.id,
          );

          const { userId, type, amount } = session.metadata as {
            userId: string;
            type: "BOOK" | "RECHARGE";
            amount: string;
          };

          console.log(session.metadata, "session.metadata");

          if (!userId || !type || !amount) {
            console.error("Missing metadata for session ID:", session.id);
            return NextResponse.json(
              { error: "Missing metadata" },
              { status: 400 },
            );
          }

          try {
            const user = await db.user.findUnique({
              where: { id: userId },
            });
            console.log(user, "user");

            if (!user) {
              throw new Error("User not found");
            }

            if (type === "BOOK") {
              const { bookId } = session.metadata as { bookId: string };
              if (!bookId) {
                throw new Error("Book ID not found in metadata");
              }

              // 创建订单
              await db.order.create({
                data: {
                  userId,
                  totalAmount: parseFloat(amount),
                  status: "PAID",
                  orderItems: {
                    create: {
                      bookId,
                      quantity: 1,
                      price: parseFloat(amount),
                    },
                  },
                },
              });

              // 更新图书库存
              await db.book.update({
                where: { id: bookId },
                data: {
                  stock: {
                    decrement: 1,
                  },
                },
              });

              console.log(`Order created for user ${userId}, book ${bookId}`);
            } else {
              const actualAmount = parseFloat(amount);
              const bonusAmount = RECHARGE_BONUS_MAP[actualAmount] ?? 0;
              const totalAmount = actualAmount + bonusAmount;

              // 更新用户余额
              const updatedUser = await db.user.update({
                where: { id: userId },
                data: {
                  balance: {
                    increment: totalAmount,
                  },
                },
              });

              // 创建充值记录
              await db.recharge.create({
                data: {
                  userId,
                  amount: totalAmount,
                  status: "SUCCESS",
                  tradeNo: session.id,
                  channel: "BANK_CARD",
                },
              });

              console.log(
                `Credit added for user ${userId}: ${totalAmount} (including bonus: ${bonusAmount})`,
              );

              // 记录交易
              await db.transaction.create({
                data: {
                  userId,
                  amount: totalAmount,
                  type: "RECHARGE",
                  status: "SUCCESS",
                  balance: updatedUser.balance.toNumber(),
                  description:
                    bonusAmount > 0
                      ? `账户充值 (含赠送${bonusAmount}元)`
                      : "账户充值",
                },
              });
            }

            return NextResponse.json({ success: true });
          } catch (error) {
            console.error(
              "Failed to process payment",
              error instanceof Error ? error.message : String(error),
            );
            return NextResponse.json(
              { error: "Failed to process payment" },
              { status: 500 },
            );
          }
          break;

        case "payment_intent.payment_failed":
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(
            `❌ Payment failed: ${failedPaymentIntent.last_payment_error?.message}`,
          );
          break;

        case "payment_intent.succeeded":
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const succeededPaymentIntent = event.data
            .object as Stripe.PaymentIntent;
          console.log(
            `💰 PaymentIntent status: ${succeededPaymentIntent.status}`,
          );
          break;

        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// 添加充值赠送金额映射
const RECHARGE_BONUS_MAP: Record<number, number> = {
  100: 10, // 充100送10
  200: 30, // 充200送30
  500: 100, // 充500送100
};
