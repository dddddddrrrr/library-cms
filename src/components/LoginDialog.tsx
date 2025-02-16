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
import { Loader2 } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { IconGitHub, IconGoogle } from "~/components/common/Icons";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
});

interface LoginModalProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
}

function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
        return;
      }

      // 登录成功
      toast.success("登录成功");
      router.push("/");
      onClose(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRegister = () => {
    onClose(false);
    router.push("/register");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold">
              登录
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.form>
          </Form>

          <motion.div
            className="mt-4 flex justify-between text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="link"
              className="h-auto p-0 text-muted-foreground"
              onClick={() => {
                onClose(false);
                router.push("/forget-password");
              }}
            >
              忘记密码？
            </Button>
            <Button
              variant="link"
              className="h-auto p-0 text-muted-foreground"
              onClick={handleRegister}
            >
              注册账号
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
