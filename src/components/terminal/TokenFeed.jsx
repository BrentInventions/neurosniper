import React from 'react';
import TokenRow from './TokenRow';
import { Zap } from 'lucide-react';

export default function TokenFeed({ tokens, selectedId, onSelect }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border bg-card/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-semibold">LIVE FEED</span>
          <span className="text-xs font-mono text-muted-foreground">({tokens.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider">STREAMING</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Waiting for new tokens...
          </div>
        ) : (
          tokens.map((token) => (
            <TokenRow
              key={token.id}
              token={token}
              selected={selectedId === token.id}
              onClick={() => onSelect(token)}
            />
          ))
        )}
      </div>
    </div>
  );
}