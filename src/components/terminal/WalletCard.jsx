import React from 'react';
import { Wallet, Copy, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatSOL, formatAddress, formatPercent } from '@/lib/formatters';

export default function WalletCard({ address, balance, pnl24h, positionsCount }) {
  const isUp = (pnl24h || 0) >= 0;
  const copy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Wallet copied');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Wallet</div>
            <button
              onClick={copy}
              className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
            >
              {formatAddress(address, 5)}
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 h-6 rounded bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</div>
          <div className="font-mono text-lg font-semibold mt-0.5">{formatSOL(balance, 2)} <span className="text-xs text-muted-foreground">SOL</span></div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">24h PnL</div>
          <div className={`font-mono text-lg font-semibold mt-0.5 flex items-center gap-1 ${isUp ? 'text-primary' : 'text-destructive'}`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {formatPercent(pnl24h)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Positions</div>
          <div className="font-mono text-lg font-semibold mt-0.5">{positionsCount}</div>
        </div>
      </div>
    </div>
  );
}