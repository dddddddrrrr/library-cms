"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Mail, Loader2, Github, Chrome } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { IconGitHub, IconGoogle } from "~/components/common/Icons";
import { Alert, AlertDescription } from "~/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
});

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function LoginModal({ isOpen, setIsOpen }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signIn("email", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            登录
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your@email.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登录
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或使用以下方式登录
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-center space-x-6">
            <div
              className="cursor-pointer rounded-full p-2 transition-colors hover:bg-accent"
              onClick={() => signIn("github", { callbackUrl: "/" })}
            >
              <IconGitHub className="h-10 w-10" />
            </div>

            <div
              className="cursor-pointer rounded-full p-2 transition-colors hover:bg-accent"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <IconGoogle className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <Button
            variant="link"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => {
              // TODO: 实现忘记密码逻辑
            }}
          >
            忘记密码？
          </Button>
          <Button
            variant="link"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => {
              // TODO: 实现注册逻辑
            }}
          >
            注册账号
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
