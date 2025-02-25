"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session && session.user.role === "USER") {
      router.push("/");
    }
    router.push("/cms/user");
  }, [router, session]);

  return <div>Dashboard</div>;
};

export default Dashboard;
