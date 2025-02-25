import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const viewsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        sortBy: z
          .enum(["createdAt"])
          .optional()
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, startDate, endDate, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: Prisma.ViewWhereInput = {};

      // 添加搜索条件
      if (search) {
        where.OR = [
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { book: { title: { contains: search } } },
          { book: { author: { contains: search } } },
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
      const orderBy: Prisma.ViewOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      try {
        const [total, views] = await Promise.all([
          ctx.db.view.count({ where }),
          ctx.db.view.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  cover: true,
                },
              },
            },
            skip,
            take: pageSize,
            orderBy,
          }),
        ]);

        return {
          views,
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        };
      } catch (error) {
        console.error("获取浏览记录失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取浏览记录失败",
        });
      }
    }),
});
