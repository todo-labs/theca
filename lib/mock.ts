import React from "react"

export interface Book {
  id: string
  title: React.ReactNode
  author: string
  description?: React.ReactNode
  metadata?: {
    label: string
    value: string
    minWidth?: string
  }[]
  coverSrc: string
  coverAlt: string
}

export const books: Book[] = [
  {
    id: "beauty-beast",
    title: "Beauty and the Beast",
    author: "Disney",
    description: "A beautiful story of love and magic.",
    coverSrc: "/images/fantasy-cover.png",
    coverAlt: "Beauty and the Beast"
  },
  {
    id: "debt",
    title: "Debt — The First 5,000 Years",
    author: "David Graeber",
    description: "Here anthropologist David Graeber presents a stunning reversal of conventional wisdom: he shows that before there was money, there was debt.",
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
    id: "fire-blood",
    title: "Fire & Blood",
    author: "George R.R. Martin",
    description: "300 years before A Game of Thrones, dragons ruled Westeros.",
    coverSrc: "/images/fantasy-cover.png",
    coverAlt: "Fire & Blood"
  },
  {
    id: "narnia",
    title: "The Chronicles of Narnia",
    author: "C.S. Lewis",
    description: "Journeys to the end of the world, fantastic creatures, and epic battles between good and evil.",
    coverSrc: "/images/fantasy-cover.png",
    coverAlt: "The Chronicles of Narnia"
  },
  {
    id: "deadpool",
    title: "Deadpool Samurai",
    author: "Sanshiro Kasama",
    description: "Deadpool moves to Tokyo and makes a mess of everything.",
    coverSrc: "/images/fantasy-cover.png",
    coverAlt: "Deadpool Samurai"
  },
  {
    id: "fantasy1",
    title: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    description: "In ancient times the Rings of Power were crafted by the Elven-smiths.",
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
    title: "The Two Towers",
    author: "J.R.R. Tolkien",
    description: "The Fellowship is broken. Some fight the enemy in the open, others go on a secret mission.",
    coverSrc: "/images/fantasy-cover.png",
    coverAlt: "The Two Towers"
  },
  {
    id: "fantasy3",
    title: "The Return of the King",
    author: "J.R.R. Tolkien",
    description: "The forces of darkness gather. The fate of Middle-earth hangs in the balance.",
    coverSrc: "/images/fantasy-cover.png",
    coverAlt: "The Return of the King"
  }
]
