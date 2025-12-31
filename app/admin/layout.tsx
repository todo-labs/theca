"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, setAuthenticated } = useAuthStore();

  useEffect(() => {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">theca Admin</h1>
          <button
            onClick={async () => {
              await fetch("/api/auth", { method: "DELETE" });
              setAuthenticated(false);
              router.push("/admin/login");
            }}
            className="px-4 py-2 text-sm hover:bg-muted rounded"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
