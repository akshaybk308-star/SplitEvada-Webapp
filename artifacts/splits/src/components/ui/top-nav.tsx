import { Link, useLocation } from "wouter";
import { ArrowLeft, Plus, Settings } from "lucide-react";

export function TopNav({ 
  title, 
  backTo, 
  action 
}: { 
  title: string; 
  backTo?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backTo && (
            <Link href={backTo} className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-accent/50">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
