import { SidebarItem } from "./sidebar-item"
import { useEffect } from "react"

interface Book {
  id: string
  coverSrc: string
  coverAlt: string
}

interface SidebarProps {
  books: Book[]
  selectedIndex: number
  onSelectBook: (index: number) => void
  itemsRef: React.MutableRefObject<(HTMLDivElement | null)[]>
}

export function Sidebar({ books, selectedIndex, onSelectBook, itemsRef }: SidebarProps) {
  useEffect(() => {
    const selectedItem = itemsRef.current[selectedIndex]
    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      })
    }
  }, [selectedIndex, itemsRef])

  return (
    <section className="relative hidden lg:flex flex-col justify-start w-[180px] xl:w-[210px] bg-background border-l border-border/30 min-h-screen">
      <div className="flex flex-col items-center gap-12 py-12 pl-8 pr-12 relative overflow-y-auto flex-1 custom-scrollbar">
        {books.map((book, index) => (
          <div
            key={book.id}
            ref={(el) => { itemsRef.current[index] = el }}
            className="w-full flex justify-center"
          >
            <SidebarItem
              src={book.coverSrc}
              alt={book.coverAlt}
              isActive={index === selectedIndex}
              onClick={() => onSelectBook(index)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
