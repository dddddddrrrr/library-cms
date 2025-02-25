import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const commentsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        rating: z.number().min(1).max(5).optional(),
        hasReplies: z.boolean().optional(),
        sortBy: z
          .enum(["createdAt", "rating"])
          .optional()
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize,
        search,
        startDate,
        endDate,
        rating,
        hasReplies,
        sortBy,
        sortOrder,
      } = input;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where: Prisma.CommentWhereInput = {
        // 只查询主评论（非回复）
        parentId: null,
      };

      // 添加评分过滤
      if (rating) {
        where.rating = rating;
      }

      // 添加是否有回复的过滤
      if (hasReplies !== undefined) {
        where.replies = hasReplies ? { some: {} } : { none: {} };
      }

      // 添加搜索条件
      if (search) {
        where.OR = [
          { content: { contains: search } },
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
      const orderBy: Prisma.CommentOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      try {
        const [total, comments] = await Promise.all([
          ctx.db.comment.count({ where }),
          ctx.db.comment.findMany({
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
              _count: {
                select: {
                  replies: true,
                  likes: true,
                },
              },
            },
            skip,
            take: pageSize,
            orderBy,
          }),
        ]);

        return {
          comments,
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        };
      } catch (error) {
        console.error("获取评论列表失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "获取评论列表失败",
        });
      }
    }),
});
