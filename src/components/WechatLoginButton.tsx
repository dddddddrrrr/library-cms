"use client";

import { signIn } from "next-auth/react";

export function WechatLoginButton() {
  return (
    <button
      onClick={() => signIn("wechat", { callbackUrl: "/" })}
      className="rounded-full bg-green-600 px-10 py-3 font-semibold text-white no-underline transition hover:bg-green-500"
    >
      使用微信登录
    </button>
  );
}
