"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, setAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
        setAuthenticated(data.isAuthenticated);

        if (!data.isAuthenticated) {
          router.push("/admin/login");
        }
      } catch (error) {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router, setAuthenticated]);

  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      <AdminNavbar />
      <main className="px-8 lg:px-16 py-12">{children}</main>
    </div>
  );
}
