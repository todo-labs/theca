"use client";

import { useState } from "react";
import {
  useAdminRecommendations,
  useUpdateRecommendationStatus,
} from "@/hooks/queries/use-recommendations-admin";
import { useCreateWishlistItem } from "@/hooks/queries/use-wishlist";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, User, Check, X, Trash2, Loader2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RecommendationsPage() {
  const { data, isLoading } = useAdminRecommendations();
  const updateStatus = useUpdateRecommendationStatus();
  const createWishlistItem = useCreateWishlistItem();
  const [activeTab, setActiveTab] = useState<"user" | "ai">("user");

  const handleAction = (id: number, type: "ai" | "user", action: string) => {
    updateStatus.mutate(
      { id, status: action, type },
      {
        onSuccess: () => {
          toast.success(`Recommendation ${action}ed`);
        },
        onError: () => {
          toast.error(`Failed to ${action} recommendation`);
        },
      },
    );
  };

  const handleAddToWishlist = (rec: any, type: "user" | "ai") => {
    const bookData = {
      title: type === "user" ? rec.bookTitle : rec.title,
      author: rec.author,
      genre: rec.genre,
      description: rec.reason || rec.submitterNote,
    };

    createWishlistItem.mutate(bookData, {
      onSuccess: () => {
        toast.success("Added to wishlist!");
      },
      onError: () => {
        toast.error("Failed to add to wishlist");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Recommendations
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage both community and AI-powered book suggestions.
            </p>
          </div>
        </div>
        <div className="flex gap-4 border-b border-border/30 pb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  const { user = [], ai = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recommendations</h2>
          <p className="text-muted-foreground text-sm">
            Manage both community and AI-powered book suggestions.
          </p>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-8 border-b border-border/10">
        <button
          onClick={() => setActiveTab("user")}
          className={cn(
            "pb-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors relative",
            activeTab === "user"
              ? "text-primary"
              : "text-muted-foreground/50 hover:text-muted-foreground",
          )}
        >
          User ({user.length})
          {activeTab === "user" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={cn(
            "pb-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors relative",
            activeTab === "ai"
              ? "text-primary"
              : "text-muted-foreground/50 hover:text-muted-foreground",
          )}
        >
          AI ({ai.length})
          {activeTab === "ai" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "user" ? (
          user.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/30 rounded-lg">
              No user recommendations yet.
            </div>
          ) : (
            user.map((rec: any) => (
              <Card
                key={rec.id}
                className="rounded-sm border-border/25 hover:border-border/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base line-clamp-1">
                        {rec.bookTitle}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        by {rec.author || "Unknown"}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rec.submitterNote && (
                    <p className="text-xs text-muted-foreground line-clamp-3 italic">
                      "{rec.submitterNote}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full",
                          rec.status === "pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : rec.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500",
                        )}
                      >
                        {rec.status}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:text-primary"
                        onClick={() => handleAddToWishlist(rec, "user")}
                        disabled={createWishlistItem.isPending}
                        title="Add to Wishlist"
                      >
                        {createWishlistItem.isPending &&
                        createWishlistItem.variables?.title ===
                          rec.bookTitle ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Gift className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:text-emerald-500"
                        onClick={() => handleAction(rec.id, "user", "approved")}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending &&
                        updateStatus.variables?.id === rec.id &&
                        updateStatus.variables?.status === "approved" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:text-rose-500"
                        onClick={() => handleAction(rec.id, "user", "rejected")}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending &&
                        updateStatus.variables?.id === rec.id &&
                        updateStatus.variables?.status === "rejected" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:text-destructive"
                        onClick={() => handleAction(rec.id, "user", "delete")}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending &&
                        updateStatus.variables?.id === rec.id &&
                        updateStatus.variables?.status === "delete" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : ai.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/30 rounded-lg">
            No AI recommendations yet.
          </div>
        ) : (
          ai.map((rec: any) => (
            <Card
              key={rec.id}
              className="rounded-sm border-border/25 hover:border-border/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-1">
                      {rec.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      by {rec.author || "Unknown"}
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rec.reason && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {rec.reason}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full",
                        rec.isAccepted
                          ? "bg-emerald-500/10 text-emerald-500"
                          : rec.isDeclined
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-blue-500/10 text-blue-500",
                      )}
                    >
                      {rec.isAccepted
                        ? "Accepted"
                        : rec.isDeclined
                          ? "Declined"
                          : "Proposed"}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-primary"
                      onClick={() => handleAddToWishlist(rec, "ai")}
                      disabled={createWishlistItem.isPending}
                      title="Add to Wishlist"
                    >
                      {createWishlistItem.isPending &&
                      createWishlistItem.variables?.title === rec.title ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Gift className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-emerald-500"
                      onClick={() => handleAction(rec.id, "ai", "accept")}
                      disabled={updateStatus.isPending || rec.isAccepted}
                    >
                      {updateStatus.isPending &&
                      updateStatus.variables?.id === rec.id &&
                      updateStatus.variables?.status === "accept" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-rose-500"
                      onClick={() => handleAction(rec.id, "ai", "decline")}
                      disabled={updateStatus.isPending || rec.isDeclined}
                    >
                      {updateStatus.isPending &&
                      updateStatus.variables?.id === rec.id &&
                      updateStatus.variables?.status === "decline" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
