import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcrypt";

export const usersRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                likes: true,
                views: true,
                orders: true,
              },
            },
          },
        });

        return user;
      } catch (error) {
        console.error("Get user error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取用户信息",
        });
      }
    }),
  fetchUserBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        balance: true,
      },
    });

    // 将 Decimal 转换为字符串返回
    return user?.balance ? user.balance.toString() : "0.00";
  }),

  // 获取用户点赞记录
  getUserLikes: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      try {
        // 获取总数
        const total = await ctx.db.like.count({
          where: {
            userId,
          },
        });

        // 获取当前页数据
        const likes = await ctx.db.like.findMany({
          where: {
            userId,
          },
          skip,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            book: {
              include: {
                category: true,
              },
            },
          },
        });

        return {
          items: likes,
          metadata: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            hasMore: skip + pageSize < total,
          },
        };
      } catch (error) {
        console.error("Get user likes error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取点赞记录",
        });
      }
    }),

  // 获取用户浏览历史
  getUserViews: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      try {
        // 获取总数
        const total = await ctx.db.view.count({
          where: {
            userId,
          },
        });

        // 获取当前页数据
        const views = await ctx.db.view.findMany({
          where: {
            userId,
          },
          skip,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            book: {
              include: {
                category: true,
              },
            },
          },
        });

        return {
          items: views,
          metadata: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            hasMore: skip + pageSize < total,
          },
        };
      } catch (error) {
        console.error("Get user views error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取浏览记录",
        });
      }
    }),

  // 获取用户订单历史
  getUserOrders: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      try {
        // 获取总数
        const total = await ctx.db.order.count({
          where: {
            userId,
          },
        });

        // 获取当前页数据
        const orders = await ctx.db.order.findMany({
          where: {
            userId,
          },
          skip,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            orderItems: {
              include: {
                book: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        });

        return {
          items: orders,
          metadata: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            hasMore: skip + pageSize < total,
          },
        };
      } catch (error) {
        console.error("Get user orders error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取订单记录",
        });
      }
    }),

  getRechargeHistory: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const recharges = await ctx.db.recharge.findMany({
          where: {
            userId: input.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return recharges;
      } catch (error) {
        console.error("Get recharge history error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "无法获取充值记录",
        });
      }
    }),

  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        emailCode: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, password, name, emailCode } = input;

        // 检查用户是否已存在
        const existingUser = await ctx.db.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "用户已存在",
          });
        }

        // 验证邮箱验证码
        // TODO: 实现邮箱验证码验证逻辑

        // 加密密码

        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const newUser = await ctx.db.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: "USER",
            balance: 0,
          },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "创建用户失败",
        });
      }
    }),
  updateUserPassword: publicProcedure
    .input(
      z.object({
        password: z.string().min(8),
        emailCode: z.string().min(6),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { password, emailCode, email } = input;

      try {
        // 先查找用户
        const user = await ctx.db.user.findUnique({
          where: { email },
          select: { password: true },
        });

        if (!user) {
          return {
            success: false,
            error: "用户不存在",
          };
        }

        // 检查新密码是否与旧密码相同
        const isSamePassword = await bcrypt.compare(password, user.password!);
        if (isSamePassword) {
          return {
            success: false,
            error: "新密码不能与原密码相同",
          };
        }

        // 验证邮箱验证码
        // TODO: 实现邮箱验证码验证逻辑

        // 更新密码
        const hashedPassword = await bcrypt.hash(password, 10);
        await ctx.db.user.update({
          where: { email },
          data: { password: hashedPassword },
        });

        return { success: true };
      } catch (error) {
        console.error("Update user password error:", error);
        return {
          success: false,
          error: "更新密码失败",
        };
      }
    }),
});
