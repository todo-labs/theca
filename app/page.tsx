"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { BookCover } from "@/components/book/book-cover"
import { BookDetails } from "@/components/book/book-details"
import { Sidebar } from "@/components/bookshelf/sidebar"

interface Book {
  id: string
  title: React.ReactNode
  author: string
  description: React.ReactNode
  metadata: {
    label: string
    value: string
    minWidth?: string
  }[]
  coverSrc: string
  coverAlt: string
}

export default function BookListingPage() {
  const books: Book[] = [
    {
      id: "debt",
      title: (
        <>
          Debt — The First<br />
          5,000 Years
        </>
      ),
      author: "David Graeber",
      description: (
        <>
          <p className="font-serif text-[15px] italic text-foreground/85 leading-[1.6]">
            Diminutive rooms, grand possibilities. Small Homes, Grand Living shows how to make use of a limited space and turn a small apartment into a design marvel.
          </p>
          <p className="leading-[1.75]">
            Here anthropologist David Graeber presents a stunning reversal of conventional wisdom: he shows that before there was money, there was debt. For more than 5,000 years, since the beginnings of the first agrarian empires, humans have used elaborate credit systems to buy and sell goods—that is, long before the invention of coins or cash.
          </p>
        </>
      ),
      metadata: [
        { label: "Editors", value: "Gestalten", minWidth: "80px" },
        { label: "Features", value: "Full color, 256 pages" },
        { label: "Release Date", value: "May 2017", minWidth: "80px" },
        { label: "Language", value: "English" },
        { label: "Format", value: "21 x 26 cm", minWidth: "80px" },
        { label: "ISBN", value: "978-3-89955-698-8" },
      ],
      coverSrc: "/images/debt-cover.png",
      coverAlt: "Debt - The First 5,000 Years"
    },
    {
      id: "fantasy1",
      title: (
        <>
          The Fellowship<br />
          of the Ring
        </>
      ),
      author: "J.R.R. Tolkien",
      description: (
        <>
          <p className="font-serif text-[15px] italic text-foreground/85 leading-[1.6]">
            In ancient times the Rings of Power were crafted by the Elven-smiths.
          </p>
          <p className="leading-[1.75]">
            One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In the Land of Mordor where the Shadows lie.
          </p>
        </>
      ),
      metadata: [
        { label: "Publisher", value: "Allen & Unwin", minWidth: "80px" },
        { label: "Features", value: "423 pages" },
        { label: "Release Date", value: "July 1954", minWidth: "80px" },
        { label: "Language", value: "English" },
        { label: "Format", value: "Hardcover", minWidth: "80px" },
        { label: "ISBN", value: "978-0-618-00221-4" },
      ],
      coverSrc: "/images/fantasy-cover.png",
      coverAlt: "The Fellowship of the Ring"
    },
    {
      id: "fantasy2",
      title: (
        <>
          The Two<br />
          Towers
        </>
      ),
      author: "J.R.R. Tolkien",
      description: (
        <>
          <p className="font-serif text-[15px] italic text-foreground/85 leading-[1.6]">
            The Fellowship is broken. Some fight the enemy in the open, others go on a secret mission.
          </p>
          <p className="leading-[1.75]">
            Frodo and Sam must travel deep into Mordor to destroy the Ring, while Aragorn and his companions defend the people of Middle-earth.
          </p>
        </>
      ),
      metadata: [
        { label: "Publisher", value: "Allen & Unwin", minWidth: "80px" },
        { label: "Features", value: "352 pages" },
        { label: "Release Date", value: "November 1954", minWidth: "80px" },
        { label: "Language", value: "English" },
        { label: "Format", value: "Hardcover", minWidth: "80px" },
        { label: "ISBN", value: "978-0-618-00222-1" },
      ],
      coverSrc: "/images/fantasy-cover.png",
      coverAlt: "The Two Towers"
    },
    {
      id: "fantasy3",
      title: (
        <>
          The Return<br />
          of the King
        </>
      ),
      author: "J.R.R. Tolkien",
      description: (
        <>
          <p className="font-serif text-[15px] italic text-foreground/85 leading-[1.6]">
            The forces of darkness gather. The fate of Middle-earth hangs in the balance.
          </p>
          <p className="leading-[1.75]">
            As the War of the Ring reaches its climax, heroes face their ultimate tests. Sacrifices must be made, and a new age begins.
          </p>
        </>
      ),
      metadata: [
        { label: "Publisher", value: "Allen & Unwin", minWidth: "80px" },
        { label: "Features", value: "416 pages" },
        { label: "Release Date", value: "October 1955", minWidth: "80px" },
        { label: "Language", value: "English" },
        { label: "Format", value: "Hardcover", minWidth: "80px" },
        { label: "ISBN", value: "978-0-618-00223-8" },
      ],
      coverSrc: "/images/fantasy-cover.png",
      coverAlt: "The Return of the King"
    }
  ]

  const [selectedBookIndex, setSelectedBookIndex] = useState(0)
  const sidebarItemsRef = useRef<(HTMLDivElement | null)[]>([])

  const selectedBook = books[selectedBookIndex]
  const otherBooks = books.filter((_, i) => i !== selectedBookIndex)

  const handleBookSelect = (index: number) => {
    setSelectedBookIndex(index)
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr_1px_auto] min-h-[calc(100vh-64px)]">
        <BookCover 
          src={selectedBook.coverSrc} 
          alt={selectedBook.coverAlt} 
        />

        <div className="hidden lg:block bg-border/40" />

        <BookDetails 
          title={selectedBook.title}
          author={selectedBook.author}
          description={selectedBook.description}
          metadata={selectedBook.metadata}
        />

        <div className="hidden lg:block bg-border/40" />

        <Sidebar 
          books={books}
          selectedIndex={selectedBookIndex}
          onSelectBook={handleBookSelect}
          itemsRef={sidebarItemsRef}
        />
      </main>
    </div>
  )
}
