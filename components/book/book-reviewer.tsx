import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface BookReviewerProps {
  name: string
  avatarSrc: string
  initials: string
  quote: string
}

export function BookReviewer({ name, avatarSrc, initials, quote }: BookReviewerProps) {
  return (
    <div className="flex items-start gap-4 pt-2">
      <Avatar className="h-10 w-10 grayscale opacity-80">
        <AvatarImage src={avatarSrc} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-1.5">
        <div>
          <p className="text-[10px] font-bold text-foreground uppercase tracking-[0.15em]">Reviewed By</p>
          <p className="text-[12px] text-muted-foreground">{name}</p>
        </div>
        <p className="text-[12px] italic text-muted-foreground/75 leading-relaxed font-serif max-w-[280px]">
          &quot;{quote}&quot;
        </p>
      </div>
    </div>
  )
}
