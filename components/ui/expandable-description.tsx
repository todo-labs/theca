"use client";

import { useState } from "react";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
  maxHeight?: string;
  className?: string;
}

export function ExpandableDescription({ 
  description, 
  maxLength = 300,
  maxHeight = "200px",
  className = ""
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > maxLength;
  
  const displayText = shouldTruncate && !isExpanded 
    ? description.substring(0, maxLength).trim() + "..."
    : description;

  return (
    <div className={`space-y-2 ${className}`}>
      <div 
        className={isExpanded ? "overflow-y-auto pr-2 scrollbar-thin" : ""}
        style={isExpanded ? { maxHeight } : undefined}
      >
        <p className="text-[13px] leading-[1.7] text-muted-foreground/85">
          {displayText}
        </p>
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

