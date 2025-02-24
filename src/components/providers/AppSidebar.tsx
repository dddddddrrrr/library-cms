"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import {
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import * as React from "react";
import { useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleTrigger } from "../ui/collapsible";
import { navItems } from "~/constants/data";
import { usePathname } from "next/navigation";
import { Icons } from "../common/Icons";
import Link from "next/link";

export const company = {
  name: "TokenBases",
  logo: GalleryVerticalEnd,
  plan: "Merchant System",
  logoUrl: "/images/logo.svg",
};

export default function AppSidebar() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const { data: user } = api.users.fetchUserInfo.useQuery();
  const renderUserAvatar = () =>
    loading ? (
      <Skeleton className="h-8 w-8 rounded-lg" />
    ) : (
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage />
        <AvatarFallback className="rounded-lg">
          {user?.name ? user.name[0] : "N"}
        </AvatarFallback>
      </Avatar>
    );

  const renderUsername = () =>
    loading ? <Skeleton className="h-4 w-20" /> : user?.name;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="text-sidebar-accent-foreground flex gap-2 py-2">
          <Image
            src={company.logoUrl}
            alt={company.name}
            width={32}
            height={32}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{company.name}</span>
            <span className="truncate text-xs">{company.plan}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link
                                href={subItem.url}
                                className="flex w-full items-center px-8 py-2"
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link
                      href={item.url}
                      className="flex w-full items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {renderUserAvatar()}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {renderUsername()}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {loading ? (
                        <Skeleton className="h-3 w-12" />
                      ) : (
                        `${user?.email}`
                      )}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {renderUserAvatar()}
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {renderUsername()}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {loading ? (
                          <Skeleton className="h-3 w-12" />
                        ) : (
                          `${user?.email}`
                        )}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 size-5" />
                  退出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
