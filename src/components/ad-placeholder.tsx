import { cn } from "@/lib/utils"

export function AdPlaceholder({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center w-full min-h-[250px] bg-secondary/50 border-2 border-dashed border-muted-foreground/30 rounded-lg", className)}>
            <p className="text-muted-foreground text-sm">Advertisement</p>
        </div>
    )
}
