interface MetadataItem {
  label: string
  value: string
  minWidth?: string
}

interface BookMetadataProps {
  items: MetadataItem[]
}

export function BookMetadata({ items }: BookMetadataProps) {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-[11px]">
      {items.map((item, index) => (
        <div key={index} className="flex gap-6">
          <span 
            className="font-bold text-foreground tracking-wide" 
            style={{ minWidth: item.minWidth || '70px' }}
          >
            {item.label}
          </span>
          <span className="text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
