import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PaymentChannel, RechargeStatus, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const rechargesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        status: z
          .enum([...Object.values(RechargeStatus)] as [string, ...string[]])
          .optional(),
        channel: z
          .enum([...Object.values(PaymentChannel)] as [string, ...string[]])
          .optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        sortBy: z
          .enum(["createdAt", "amount"])
          .optional()
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize,
        status,
        channel,
        search,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      } = input;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: Prisma.RechargeWhereInput = {};

      // 添加状态过滤
      if (status) {
        where.status = status as RechargeStatus;
      }

      // 添加支付渠道过滤
      if (channel) {
        where.channel = channel as PaymentChannel;
      }

      // 添加搜索条件
      if (search) {
        where.OR = [
          { id: { contains: search } },
          { tradeNo: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ];
      }

      // 添加日期范围过滤
      if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) {
          where.createdAt.gte = startDate;
        }

        if (endDate) {
          where.createdAt.lte = new Date(
            new Date(endDate).setHours(23, 59, 59, 999),
          );
        }
      }

      // 构建排序条件
      const orderBy: Prisma.RechargeOrderByWithRelationInput = {};
      orderBy[sortBy as keyof Prisma.RechargeOrderByWithRelationInput] = sortOrder;

      try {
        const [total, recharges] = await Promise.all([
          ctx.db.recharge.count({ where }),
          ctx.db.recharge.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            skip,
            take: pageSize,
            orderBy,
          }),
        ]);

        return {
          recharges,
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        };
      } catch (error) {
        console.error("获取充值记录列表失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取充值记录列表失败",
        });
      }
    }),
});
