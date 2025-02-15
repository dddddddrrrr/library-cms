import Stripe from "stripe";

export enum PaymentMethod {
  creditCard = "creditCard",
  wechat = "wechat",
  alipay = "alipay",
}

interface Book {
  id: string;
  title: string;
  price: number;
  cover: string;
}

interface CheckoutSessionParams {
  priceInRMB: number;
  userId: string;
  book?: Book;
  type: "BOOK" | "RECHARGE";
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (
  params: CheckoutSessionParams,
): Promise<{ success: boolean; sessionId?: string; productTitle?: string }> => {
  try {
    const baseUrl = process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      throw new Error("Base URL is not defined in environment variables.");
    }

    let productData: {
      name: string;
      description?: string;
      images?: string[];
    };

    let metadata: Record<string, string> = {
      userId: params.userId,
      type: params.type,
      amount: params.priceInRMB.toString(),
    };

    // 根据支付类型设置不同的商品信息
    if (params.type === "BOOK" && params.book) {
      productData = {
        name: params.book.title,
        description: `购买图书: ${params.book.title}`,
        images: params.book.cover ? [params.book.cover] : undefined,
      };
      metadata = {
        ...metadata,
        bookId: params.book.id,
        bookTitle: params.book.title,
      };
    } else {
      productData = {
        name: "账户充值",
        description: `充值金额: ¥${params.priceInRMB}`,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "wechat_pay", "alipay"],
      payment_method_options: {
        wechat_pay: {
          client: "web",
        },
      },
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: productData,
            unit_amount: Math.round(params.priceInRMB * 100), // 转换为分
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata,
    });

    return {
      success: true,
      sessionId: session.id,
      productTitle: params.type === "BOOK" ? params.book?.title : "账户充值",
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false };
  }
};
