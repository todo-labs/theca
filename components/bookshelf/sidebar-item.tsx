import Image from "next/image"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  src: string
  alt: string
  isActive?: boolean
}

export function SidebarItem({ src, alt, isActive }: SidebarItemProps) {
  return (
    <div className={cn(
      "group relative cursor-pointer transition-all duration-300 flex items-center justify-center",
      isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
    )}>
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
