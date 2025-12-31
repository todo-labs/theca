import Image from "next/image"

interface BookCoverProps {
  src: string
  alt: string
}

export function BookCover({ src, alt }: BookCoverProps) {
  return (
    <section className="relative flex flex-col items-center justify-center bg-muted/30 py-16 px-8 h-full">
      <div className="relative z-10 duration-500 hover:scale-[1.02]">
        <div className="relative shadow-2xl shadow-black/15 transition-all duration-500 hover:shadow-3xl hover:shadow-black/25 rounded-sm overflow-hidden">
          <Image
            src={src}
            alt={alt}
            width={420}
            height={630}
            className="h-auto w-[320px] lg:w-[420px] object-cover"
            priority
          />
        </div>
        <p className="mt-10 text-center text-[10px] font-bold tracking-[0.25em] text-muted-foreground/50 uppercase">
          Click for preview
        </p>
      </div>
    </section>
  )
}
