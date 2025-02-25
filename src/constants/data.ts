import { type Icons } from "~/components/common/Icons";

interface NavItem {
  title: string;
  url: string;
  icon?: keyof typeof Icons;
  items?: NavItem[];
  isActive?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: "用户管理",
    url: "/cms/user",
    icon: "user2",
  },
  {
    title: "书本管理",
    url: "/cms/book",
    icon: "media",
  },
  {
    title: "订单管理",
    url: "/cms/orders",
    icon: "billing",
  },
  {
    title: "充值管理",
    url: "/cms/recharges",
    icon: "settings",
  },
  {
    title: "浏览记录",
    url: "/cms/views",
    icon: "laptop",
  },
  {
    title: "评论管理",
    url: "/cms/comments",
    icon: "laptop",
  },
  
];
