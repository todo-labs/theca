import { RollingBookshelf } from "@/components/admin/rolling-bookshelf";
import { AddBookModal } from "@/components/modals/add-book-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        <AddBookModal
          trigger={
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          }
        />
      </div>
      <RollingBookshelf />
    </div>
  );
}
