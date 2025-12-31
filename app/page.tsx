import { Header } from "@/components/layout/header"
import { BookCover } from "@/components/book/book-cover"
import { BookDetails } from "@/components/book/book-details"
import { Sidebar } from "@/components/bookshelf/sidebar"

export default function BookListingPage() {
  const bookData = {
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
    reviewer: {
      name: "Christopher Reath",
      avatarSrc: "/images/reviewer.png",
      initials: "CR",
      quote: "I didn't really finish reading this book. I'm not qualified to review this shit."
    }
  }

  const activeBook = {
    src: "/images/debt-cover.png",
    alt: "Current Book"
  }

  const suggestedBooks = [
    { src: "/images/fantasy-cover.png", alt: "Suggested Book 1" },
    { src: "/images/fantasy-cover.png", alt: "Suggested Book 2" },
    { src: "/images/fantasy-cover.png", alt: "Suggested Book 3" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr_1px_auto] min-h-[calc(100vh-64px)]">
        <BookCover 
          src={activeBook.src} 
          alt={activeBook.alt} 
        />

        <div className="hidden lg:block bg-border/40" />

        <BookDetails {...bookData} />

        <div className="hidden lg:block bg-border/40" />

        <Sidebar 
          activeBook={activeBook} 
          suggestedBooks={suggestedBooks} 
        />
      </main>
    </div>
  )
}
