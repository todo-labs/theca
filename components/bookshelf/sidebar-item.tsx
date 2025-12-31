import Image from "next/image"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  src: string
  alt: string
  isActive?: boolean
  onClick?: () => void
}

export function SidebarItem({ src, alt, isActive, onClick }: SidebarItemProps) {
  return (
    <div 
      className={cn(
        "group relative cursor-pointer transition-all duration-300 flex flex-col items-center",
        isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
      )}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute -left-[44px] top-0 h-[140px] w-[4px] bg-primary" />
      )}
      <Image
        src={src}
        alt={alt}
        width={100}
        height={140}
        className={cn(
          "shadow-lg transition-all duration-300",
          isActive && "shadow-xl"
        )}
      />
    </div>
  )
}
