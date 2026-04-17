import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatSOL, formatAddress, timeAgo } from '@/lib/formatters';

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
        No recent activity
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {activities.map((a) => {
        const isBuy = a.type === 'buy';
        return (
          <div
            key={a.id}
            className="flex items-center gap-2 px-3 py-2 border-b border-border/40 text-xs font-mono hover:bg-secondary/40"
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                isBuy ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
              }`}
            >
              {isBuy ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            </div>
            <span className={`uppercase font-semibold ${isBuy ? 'text-primary' : 'text-destructive'}`}>
              {a.type}
            </span>
            <span className="text-foreground">{formatSOL(a.amount_sol)} SOL</span>
            <span className="text-muted-foreground ml-auto">{formatAddress(a.wallet, 3)}</span>
            <span className="text-muted-foreground w-10 text-right">{timeAgo(a.timestamp)}</span>
          </div>
        );
      })}
    </div>
  );
}