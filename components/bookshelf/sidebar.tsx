import { SidebarItem } from "./sidebar-item"

interface SidebarProps {
  activeBook: {
    src: string
    alt: string
  }
  suggestedBooks: {
    src: string
    alt: string
  }[]
}

export function Sidebar({ activeBook, suggestedBooks }: SidebarProps) {
  return (
    <section className="relative hidden lg:flex flex-col justify-start w-[180px] xl:w-[200px] bg-background">
      <div className="flex flex-col items-center gap-8 py-12 px-8 relative">
        {/* Active Item Indicator Line - positioned on the left */}
        <div className="absolute left-0 top-[60px] h-[140px] w-[3px] bg-primary/80" />
        
        <SidebarItem {...activeBook} isActive />

        {/* Other Items */}
        {suggestedBooks.map((book, i) => (
          <SidebarItem key={i} {...book} />
        ))}
      </div>
    </section>
  )
}
