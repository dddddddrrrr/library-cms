"use client";

import * as React from "react";
import { type LucideProps } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "~/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircuitBoardIcon,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  LayoutDashboardIcon,
  Loader2,
  LogIn,
  LucideIcon,
  LucideShoppingBag,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  UserCircle2Icon,
  UserPen,
  UserX2Icon,
  X,
} from "lucide-react";

export const WechatIcon = ({ ...props }: React.ComponentProps<"svg">) => {
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M104.99 0.552368C47.2423 0.552368 0 47.75 0 105.445V407.086C0 464.774 47.2423 511.964 104.99 511.964H406.976C464.424 511.964 511.488 465.255 511.97 407.974V104.56C511.488 47.2687 464.424 0.552368 406.976 0.552368H104.99Z"
        fill="url(#paint0_linear_1_62)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M463 305C463 247.515 407.031 201 338 201C268.965 201 213 247.515 213 305C213 362.278 268.965 408.793 338 409C352.262 408.793 366.034 406.761 379 403C379.96 402.743 379.882 402.754 382.397 402.261C384.913 401.767 387.101 403 389 404L416 420C417.243 420.665 417.978 421 419 421C421.189 421 423.048 419.139 423 417C423.048 415.818 422.671 414.879 422.378 413.889C422.085 412.899 418.735 400.699 417 393C416.754 391.91 416.62 391.282 416.62 389.218C416.62 387.154 417.689 384.938 420 383C446.159 364.382 463 336.199 463 305ZM295.515 287C287.166 287 280 279.838 280 270.515C280 262.165 287.166 255 295.515 255C304.841 255 312 262.165 312 270.515C312 279.838 304.841 287 295.515 287ZM378.515 287C370.166 287 363 279.838 363 270.515C363 262.165 370.166 255 378.515 255C387.841 255 395 262.165 395 270.515C395 279.838 387.841 287 378.515 287Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48 211C48 248.249 68.1957 282.061 100 305C102.343 306.724 103.596 308.697 103.595 312.008C103.596 313.152 103.395 314.383 103 316C100.341 326.88 97.4207 339.332 97 341C96.5793 342.668 95.9162 343.779 96 345C95.9162 347.769 98.1487 350 101 350C101.997 350 102.885 349.594 104 349L137 330C139.089 328.736 141.435 328.084 143.018 328.084C144.601 328.084 147.243 328.576 149 329C164.299 332.91 180.818 335.355 198 335C200.689 335.355 203.432 335.284 206 335C202.904 325.433 201.124 315.191 201 305C201.124 241.807 262.339 190.894 338 191C340.594 190.894 343.3 190.979 346 191C334.709 131.55 272.721 86 198 86C115.124 86 48 141.824 48 211ZM147 191C135.953 191 127 182.048 127 171C127 159.955 135.953 151 147 151C158.047 151 167 159.955 167 171C167 182.048 158.047 191 147 191ZM247 191C235.952 191 227 182.048 227 171C227 159.955 235.952 151 247 151C258.045 151 267 159.955 267 171C267 182.048 258.045 191 247 191Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_62"
          x1="0"
          y1="0.552368"
          x2="0"
          y2="511.964"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#20D329" />
          <stop offset="1" stopColor="#1BB623" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const BookIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* 添加图标路径 */}
  </svg>
);

export const BookstoreIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const IconGoogle = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6 transition-colors hover:opacity-80", className)}
      {...props}
    >
      <path
        d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
        fill="#FFC107"
      />
      <path
        d="M6.30603 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.65603 8.337 6.30603 14.691Z"
        fill="#FF3D00"
      />
      <path
        d="M23.9999 44C29.1659 44 33.8599 42.023 37.4089 38.808L31.2189 33.57C29.1435 35.1484 26.6074 36.0021 23.9999 36C18.7979 36 14.3809 32.683 12.7169 28.054L6.19495 33.079C9.50495 39.556 16.2269 44 23.9999 44Z"
        fill="#4CAF50"
      />
      <path
        d="M43.611 20.083H42V20H24V28H35.303C34.5142 30.2164 33.0934 32.1532 31.216 33.571L31.219 33.569L37.409 38.807C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
        fill="#1976D2"
      />
    </svg>
  );
};

export const IconGitHub = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <circle cx="36" cy="36" r="36" fill="white" />
      <path
        d="M0 36.0304C0 51.767 10.0747 65.1469 24.1161 70.0587C26.0079 70.5397 25.7196 69.187 25.7196 68.2731V62.0296C14.8012 63.3102 14.3658 56.0776 13.6271 54.8722C12.1436 52.3381 8.64829 51.6918 9.69029 50.4864C12.1767 49.2058 14.7111 50.8111 17.6419 55.1548C19.7649 58.3021 23.9059 57.77 26.0109 57.244C26.4627 55.3802 27.4307 53.6818 28.8036 52.3441C17.4948 50.3181 12.7772 43.4072 12.7772 35.1857C12.7772 31.1997 14.0925 27.5353 16.666 24.5774C15.0264 19.7016 16.8191 15.5322 17.0563 14.913C21.7348 14.4921 26.5875 18.2647 26.9658 18.5593C29.6234 17.8408 32.6533 17.4621 36.0435 17.4621C39.4518 17.4621 42.4997 17.8529 45.1723 18.5803C46.0732 17.8889 50.5835 14.6514 54.9316 15.0482C55.1629 15.6675 56.9135 19.7407 55.3731 24.5473C57.9826 27.5113 59.3098 31.2087 59.3098 35.2067C59.3098 43.4403 54.5653 50.3571 43.2234 52.3592C44.1948 53.317 44.9659 54.4589 45.4918 55.7182C46.0177 56.9775 46.2878 58.329 46.2864 59.6939V68.7571C46.3494 69.4816 46.2864 70.2 47.4965 70.2C61.7422 65.3933 72 51.9143 72 36.0364C72 16.1244 55.8776 3.78022e-06 36.0045 3.78022e-06C16.1074 -0.00901433 0 16.1184 0 36.0304Z"
        fill="#282828"
      />
    </svg>
  );
};

export type Icon = LucideIcon;

export const Icons = {
  dashboard: LayoutDashboardIcon,
  logo: BookstoreIcon,
  login: LogIn,
  close: X,
  product: LucideShoppingBag,
  spinner: Loader2,
  kanban: CircuitBoardIcon,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  employee: UserX2Icon,
  post: FileText,
  page: File,
  userPen: UserPen,
  user2: UserCircle2Icon,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  gitHub: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      ></path>
    </svg>
  ),
  twitter: Twitter,
  check: Check,
};
