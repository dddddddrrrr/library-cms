import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createCheckoutSession } from "~/server/util/payment";
import { TRPCError } from "@trpc/server";

const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  cover: z.string().optional(),
});

export const paymentRouter = createTRPCRouter({
  // 创建图书购买支付会话
  createBookCheckoutSession: protectedProcedure
    .input(
      z.object({
        book: bookSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "请先登录",
        });
      }

      try {
        const result = await createCheckoutSession({
          priceInRMB: input.book.price,
          userId: ctx.session.user.id,
          book: {
            ...input.book,
            cover: input.book.cover ?? "",
          },
          type: "BOOK",
        });

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "创建支付会话失败",
          });
        }

        return result;
      } catch (error) {
        console.error("Payment session creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "创建支付会话失败",
        });
      }
    }),

  // 创建余额充值支付会话
  createRechargeCheckoutSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1), // 实际支付金额
        bonus: z.number().min(0), // 赠送金额
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      return createCheckoutSession({
        priceInRMB: input.amount,
        userId,
        type: "RECHARGE",
      });
    }),

  purchaseWithBalance: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookId, amount } = input;
      const userId = ctx.session.user.id;

      try {
        // 使用事务确保数据一致性
        return await ctx.db.$transaction(async (tx) => {
          // 检查用户余额
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { balance: true },
          });

          if (!user || user.balance.lessThan(amount)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "余额不足",
            });
          }

          // 扣除用户余额
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              balance: {
                decrement: amount,
              },
            },
          });

          // 创建订单
          const order = await tx.order.create({
            data: {
              userId,
              totalAmount: amount,
              status: "PAID",
              orderItems: {
                create: {
                  bookId,
                  quantity: 1,
                  price: amount,
                },
              },
            },
          });

          // 更新图书库存
          await tx.book.update({
            where: { id: bookId },
            data: {
              stock: {
                decrement: 1,
              },
            },
          });

          // 记录交易
          await tx.transaction.create({
            data: {
              userId,
              amount,
              type: "PAYMENT",
              status: "SUCCESS",
              balance: updatedUser.balance.toNumber(),
              description: "购买图书",
            },
          });

          return { success: true, orderId: order.id };
        });
      } catch (error) {
        console.error("Purchase with balance error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "购买失败",
        });
      }
    }),
});
