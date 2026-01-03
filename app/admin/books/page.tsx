import { RollingBookshelf } from "@/components/admin/rolling-bookshelf";
import { SmartBookOnboarding } from "@/components/modals/smart-book-onboarding";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Camera } from "lucide-react";
import Link from "next/link";

export default function BooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Book Collection</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your reading library
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/books/add">
            <Button variant="outline" className="flex items-center gap-2 h-11">
              <Camera className="w-4 h-4" />
              Import from Photos
            </Button>
          </Link>
          <SmartBookOnboarding
            trigger={
              <Button className="flex items-center gap-2 rounded-full h-11 px-6 bg-primary shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" />
                Quick Add
              </Button>
            }
          />
        </div>
      </div>
      <RollingBookshelf />
    </div>
  );
}
