"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from "@/lib/utils"

interface MarkdownProps {
  children: string
  className?: string
}

const Markdown = ({ children, className }: MarkdownProps) => {
  return (
    <div className={cn("w-full", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => (
            <h1
              className={cn(
                "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
                className
              )}
              {...props}
            />
          ),
          h2: ({ className, ...props }) => (
            <h2
              className={cn(
                "mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
                className
              )}
              {...props}
            />
          ),
          h3: ({ className, ...props }) => (
            <h3
              className={cn(
                "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
                className
              )}
              {...props}
            />
          ),
          h4: ({ className, ...props }) => (
            <h4
              className={cn(
                "mt-4 scroll-m-20 text-xl font-semibold tracking-tight",
                className
              )}
              {...props}
            />
          ),
          p: ({ className, ...props }) => (
            <p
              className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
              {...props}
            />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn("mt-6 border-l-2 pl-6 italic", className)}
              {...props}
            />
          ),
          ul: ({ className, ...props }) => (
            <ul
              className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
              {...props}
            />
          ),
          ol: ({ className, ...props }) => (
            <ol
              className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
              {...props}
            />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("mt-2", className)} {...props} />
          ),
          table: ({ className, ...props }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className={cn("w-full", className)} {...props} />
            </div>
          ),
          tr: ({ className, ...props }) => (
            <tr
              className={cn("even:bg-muted m-0 border-t p-0", className)}
              {...props}
            />
          ),
          th: ({ className, ...props }) => (
            <th
              className={cn(
                "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
                className
              )}
              {...props}
            />
          ),
          td: ({ className, ...props }) => (
            <td
              className={cn(
                "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
                className
              )}
              {...props}
            />
          ),
          code: ({ className, ...props }) => (
            <code
              className={cn(
                "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                className
              )}
              {...props}
            />
          ),
          a: ({ className, ...props }) => (
            <a
              className={cn(
                "text-primary font-medium underline underline-offset-4",
                className
              )}
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}


export default Markdown

