"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn, getUserInitials } from "~/lib/utils";

const UserAvatar = ({
  className,
  customStyle,
}: {
  className?: string;
  customStyle?: string;
}) => {
  const { data: session } = useSession();
  const avatarUrl = session?.user.image;
  const displayName = session?.user.name ?? "";

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatarUrl ?? ""} />
      <AvatarFallback className={cn("bg-custom-gradient text-sm", customStyle)}>
        {displayName}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
