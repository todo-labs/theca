import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useLogout() {
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      setAuthenticated(false);
      queryClient.clear(); // Clear all cache on logout
      router.push("/admin/login");
    },
  });
}
