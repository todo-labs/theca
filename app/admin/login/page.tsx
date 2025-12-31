"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed", {
          description: "Please check your authenticator code and try again.",
        });
        return;
      }

      toast.success("Authentication successful", {
        description: "Redirecting to admin dashboard...",
      });
      
      router.push("/admin");
    } catch (err) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-lg">
        {/* Login Card */}
        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl">Admin Login</CardTitle>
              </div>
            </div>
            <CardDescription className="text-center text-base">
              Enter your 6-digit authenticator code
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Input - Much Larger */}
              <div className="flex justify-center">
                <InputOTP
                  value={token}
                  onChange={setToken}
                  maxLength={6}
                  disabled={loading}
                  containerClassName="gap-3"
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot 
                      index={0} 
                      className="h-16 w-16 text-2xl font-semibold !rounded-xl border-2 first:!rounded-xl last:!rounded-xl"
                    />
                    <InputOTPSlot 
                      index={1} 
                      className="h-16 w-16 text-2xl font-semibold !rounded-xl border-2 first:!rounded-xl last:!rounded-xl"
                    />
                    <InputOTPSlot 
                      index={2} 
                      className="h-16 w-16 text-2xl font-semibold !rounded-xl border-2 first:!rounded-xl last:!rounded-xl"
                    />
                    <InputOTPSlot 
                      index={3} 
                      className="h-16 w-16 text-2xl font-semibold !rounded-xl border-2 first:!rounded-xl last:!rounded-xl"
                    />
                    <InputOTPSlot 
                      index={4} 
                      className="h-16 w-16 text-2xl font-semibold !rounded-xl border-2 first:!rounded-xl last:!rounded-xl"
                    />
                    <InputOTPSlot 
                      index={5} 
                      className="h-16 w-16 text-2xl font-semibold !rounded-xl border-2 first:!rounded-xl last:!rounded-xl"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-14 font-semibold rounded-xl"
                disabled={loading || token.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="pt-6 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Protected by TOTP authentication • Unauthorized access is prohibited
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
