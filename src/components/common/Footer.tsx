import { Github } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-card/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* 关于我们 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">关于我们</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary">
                  关于图书馆
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>

          {/* 帮助中心 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">帮助中心</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-primary">
                  常见问题
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-primary">
                  使用指南
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-primary">
                  意见反馈
                </Link>
              </li>
            </ul>
          </div>

          {/* 友情链接 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">友情链接</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://www.douban.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  豆瓣读书
                </a>
              </li>
              <li>
                <a
                  href="https://www.goodreads.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Goodreads
                </a>
              </li>
            </ul>
          </div>

          {/* 关注我们 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">关注我们</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              {/* 可以添加更多社交媒体图标 */}
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 text-center sm:flex-row sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} 图书馆. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-primary">
                服务条款
              </Link>
              <Link href="/privacy" className="hover:text-primary">
                隐私政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 