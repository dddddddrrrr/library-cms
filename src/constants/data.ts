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
    title: "仪表盘",
    url: "/dashboard",
    icon: "dashboard",
  },
  {
    title: "用户管理",
    url: "/dashboard/user",
    icon: "user",
  },
  {
    title: "商品管理",
    url: "/product",
    icon: "product",
    items: [
      {
        title: "商品列表",
        url: "/product/list",
      },
      {
        title: "添加商品",
        url: "/product/add",
      },
    ],
  },
  {
    title: "订单管理",
    url: "/order",
    icon: "billing",
  },
  {
    title: "系统设置",
    url: "/settings",
    icon: "settings",
  },
];
