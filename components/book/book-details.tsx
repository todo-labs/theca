"use client";

import { BookMetadata } from "@/components/book/book-metadata";
import { ExpandableDescription } from "@/components/ui/expandable-description";

interface BookDetailsProps {
  title: React.ReactNode;
  author: string;
  description: string;
  metadata: {
    label: string;
    value: React.ReactNode;
    minWidth?: string;
  }[];
}

export function BookDetails({
  title,
  author,
  description,
  metadata,
}: BookDetailsProps) {
  return (
    <section className="flex flex-col justify-center h-full px-10 py-12 lg:px-14 xl:px-16">
      <div className="space-y-8 max-w-md">
        <div className="space-y-3">
          <h1 className="font-serif text-[2.75rem] leading-[1.05] font-normal text-foreground tracking-tight">
            {title}
          </h1>
          <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground/70 uppercase pt-1">
            by {author}
          </p>
        </div>

        {description && (
          <ExpandableDescription description={description} />
        )}

        <div className="border-t border-border/30 my-6" />

        <BookMetadata items={metadata} />
      </div>
    </section>
  );
}
