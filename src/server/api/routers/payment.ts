import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
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
        amount: z.number().min(1), // 最小充值金额1元
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
});
