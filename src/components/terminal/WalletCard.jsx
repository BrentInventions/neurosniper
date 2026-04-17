import React from 'react';
import { Wallet, Copy, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatSOL, formatAddress, formatPercent } from '@/lib/formatters';

export default function WalletCard({ address, balance, pnl24h, positionsCount, wsStatus }) {
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
        <div className={`flex items-center gap-1 px-2 h-6 rounded border ${
          wsStatus === 'live' ? 'bg-primary/10 border-primary/20' :
          wsStatus === 'error' ? 'bg-destructive/10 border-destructive/20' :
          'bg-secondary border-border'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            wsStatus === 'live' ? 'bg-primary pulse-dot' :
            wsStatus === 'error' ? 'bg-destructive' :
            'bg-muted-foreground animate-pulse'
          }`} />
          <span className={`text-[10px] font-mono uppercase tracking-wider ${
            wsStatus === 'live' ? 'text-primary' :
            wsStatus === 'error' ? 'text-destructive' :
            'text-muted-foreground'
          }`}>
            {wsStatus === 'live' ? 'Live' : wsStatus === 'error' ? 'Reconnecting' : 'Connecting'}
          </span>
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