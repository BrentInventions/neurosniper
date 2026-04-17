import React from 'react';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import PriceFlash from './PriceFlash';
import { formatUSD, formatPrice, formatPercent, formatAddress, timeAgo } from '@/lib/formatters';

export default function TokenRow({ token, selected, onClick, now }) {
  const change = token.price_change_5m || 0;
  const isUp = change >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors group ${
        selected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/50 border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-border flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-mono font-bold text-primary">
            {token.symbol?.slice(0, 2)}
          </span>
        </div>

        {/* Name + address */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{token.symbol}</span>
            {token.is_trending && (
              <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" fill="currentColor" />
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
            <span>{formatAddress(token.mint_address, 3)}</span>
            <span>·</span>
            <span>{timeAgo(token.launched_at)}</span>
          </div>
        </div>

        {/* Market cap */}
        <div className="hidden sm:block text-right">
          <div className="text-xs text-muted-foreground">MC</div>
          <div className="font-mono text-sm">
            <PriceFlash value={token.market_cap}>{formatUSD(token.market_cap)}</PriceFlash>
          </div>
        </div>

        {/* Price */}
        <div className="text-right w-24">
          <div className="text-xs text-muted-foreground">Price</div>
          <div className="font-mono text-sm">
            <PriceFlash value={token.price}>${formatPrice(token.price)}</PriceFlash>
          </div>
        </div>

        {/* Change */}
        <div className={`text-right w-20 flex flex-col items-end ${isUp ? 'text-primary' : 'text-destructive'}`}>
          <div className="flex items-center gap-0.5 text-xs">
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            5m
          </div>
          <div className="font-mono text-sm font-semibold">{formatPercent(change)}</div>
        </div>
      </div>

      {/* Bonding curve */}
      {token.bonding_curve_progress !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, token.bonding_curve_progress)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
            {token.bonding_curve_progress.toFixed(0)}%
          </span>
        </div>
      )}
    </button>
  );
}