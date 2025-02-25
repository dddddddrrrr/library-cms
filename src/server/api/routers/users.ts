import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcrypt";
import { Decimal } from "@prisma/client/runtime/library";

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
  fetchUserInfo: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
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

  fetchAllUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(["ADMIN", "USER"]).optional(),
        // 支持单独的余额最小值和最大值
        balanceMin: z.string().optional(),
        balanceMax: z.string().optional(),
        // 支持余额范围对象
        balanceRange: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
          })
          .optional(),
        // 支持单独的日期开始和结束
        createdAtStart: z.string().optional(),
        createdAtEnd: z.string().optional(),
        // 支持日期范围对象
        dateRange: z
          .object({
            from: z.date().optional(),
            to: z.date().optional(),
          })
          .optional(),
        sortBy: z.enum(["createdAt", "name", "email", "balance"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize,
        name,
        email,
        role,
        balanceMin,
        balanceMax,
        balanceRange,
        createdAtStart,
        createdAtEnd,
        dateRange,
        sortBy,
        sortOrder,
      } = input;
      const skip = (page - 1) * pageSize;

      // 处理余额范围
      let finalBalanceMin: number | undefined = undefined;
      let finalBalanceMax: number | undefined = undefined;

      if (balanceRange) {
        finalBalanceMin = balanceRange.min;
        finalBalanceMax = balanceRange.max;
      } else {
        if (balanceMin) finalBalanceMin = parseFloat(balanceMin);
        if (balanceMax) finalBalanceMax = parseFloat(balanceMax);
      }

      // 处理日期范围
      let finalDateFrom: Date | undefined = undefined;
      let finalDateTo: Date | undefined = undefined;

      if (dateRange) {
        finalDateFrom = dateRange.from;
        finalDateTo = dateRange.to;
      } else {
        if (createdAtStart) finalDateFrom = new Date(createdAtStart);
        if (createdAtEnd) finalDateTo = new Date(createdAtEnd);
      }

      const where = {
        AND: [
          // 搜索条件
          name
            ? {
                OR: [
                  { name: { contains: name, mode: "insensitive" as const } },
                  { email: { contains: name, mode: "insensitive" as const } },
                ],
              }
            : {},
          // 精确邮箱匹配
          email ? { email: { equals: email } } : {},
          // 角色筛选
          role ? { role } : {},
          // 余额范围
          finalBalanceMin || finalBalanceMax
            ? {
                balance: {
                  gte: finalBalanceMin
                    ? new Decimal(finalBalanceMin)
                    : undefined,
                  lte: finalBalanceMax
                    ? new Decimal(finalBalanceMax)
                    : undefined,
                },
              }
            : {},
          // 创建时间范围
          finalDateFrom || finalDateTo
            ? {
                createdAt: {
                  gte: finalDateFrom,
                  lte: finalDateTo,
                },
              }
            : {},
        ],
      };

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: sortBy
            ? {
                [sortBy]: sortOrder ?? ("desc" as const),
              }
            : {
                createdAt: "desc" as const,
              },
          skip,
          take: pageSize,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            balance: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        items: users,
        metadata: {
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        },
      };
    }),
  updateUserBalance: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        balance: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, balance } = input;

      try {
        // 查找用户，确保用户存在
        const user = await ctx.db.user.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "用户不存在",
          });
        }

        // 更新用户余额
        const updatedUser = await ctx.db.user.update({
          where: { id },
          data: { balance: new Decimal(balance) },
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
          },
        });

        return {
          success: true,
          user: updatedUser,
          message: "余额更新成功",
        };
      } catch (error) {
        console.error("Update user balance error:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "更新余额失败",
        });
      }
    }),
});
