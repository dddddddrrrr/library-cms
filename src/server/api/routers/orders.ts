import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { OrderStatus, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const ordersRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        status: z
          .enum([...Object.values(OrderStatus)] as [string, ...string[]])
          .optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        sortBy: z
          .enum(["createdAt", "totalAmount"])
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
        search,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      } = input;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: Prisma.OrderWhereInput = {};

      // 添加状态过滤
      if (status) {
        where.status = status as OrderStatus;
      }

      // 添加搜索条件
      if (search) {
        where.OR = [
          { id: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { orderItems: { some: { book: { title: { contains: search } } } } },
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
      const orderBy: Prisma.OrderOrderByWithRelationInput = {};
      orderBy[sortBy as keyof Prisma.OrderOrderByWithRelationInput] = sortOrder;

      try {
        const [total, orders] = await Promise.all([
          ctx.db.order.count({ where }),
          ctx.db.order.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              orderItems: {
                include: {
                  book: {
                    select: {
                      id: true,
                      title: true,
                      cover: true,
                    },
                  },
                },
              },
            },
            skip,
            take: pageSize,
            orderBy,
          }),
        ]);

        return {
          orders,
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        };
      } catch (error) {
        console.error("获取订单列表失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取订单列表失败",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const order = await ctx.db.order.findUnique({
          where: { id: input.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            orderItems: {
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    cover: true,
                    author: true,
                    price: true,
                  },
                },
              },
            },
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "订单不存在",
          });
        }

        return order;
      } catch (error) {
        console.error("获取订单详情失败:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取订单详情失败",
        });
      }
    }),
});
