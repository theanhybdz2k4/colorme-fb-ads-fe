import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-border/50 bg-secondary/30 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex h-11 w-full rounded-full border px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:bg-secondary/50 selection:bg-primary/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
