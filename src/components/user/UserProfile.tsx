"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { User, Bell, Settings, LogOut } from "lucide-react";
import UserAvatar from "~/components/user/UserAvatar";
import { signOut } from "next-auth/react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger>
          <UserAvatar />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mt-1 flex min-w-[260px] flex-col space-y-1 rounded-xl p-2"
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div
            onClick={() => {
              router.push(`/personal-center/${session?.user.id}`);
            }}
            className="flex cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2D2D2D]"
          >
            <User className="mr-2 h-5 w-4" />
            个人中心
          </div>
          <div className="flex cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2D2D2D]">
            <Bell className="mr-2 h-5 w-4" />
            通知
          </div>
          <div
            onClick={() => {
              // toggleSettingDialog();
            }}
            className="flex cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2D2D2D]"
          >
            <Settings className="mr-2 h-5 w-4" /> 账号设置
          </div>
          <div
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/");
            }}
            className="flex cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2D2D2D]"
          >
            <LogOut className="mr-2 h-5 w-4" /> 退出登录
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserProfile;
