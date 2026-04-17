import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle, Target, ShieldAlert } from 'lucide-react';
import { tradingApi } from '@/lib/tradingApi';
import { toast } from 'sonner';

export default function TradePanel({ token, strategy }) {
  const [amount, setAmount] = useState(strategy?.buy_amount_sol || 0.1);
  const [autoBuy, setAutoBuy] = useState(strategy?.auto_buy || false);
  const [autoSell, setAutoSell] = useState(strategy?.auto_sell || false);
  const [takeProfit, setTakeProfit] = useState(strategy?.take_profit_multiplier || 2);
  const [stopLoss, setStopLoss] = useState(strategy?.stop_loss_percent || 30);
  const [status, setStatus] = useState('idle'); // idle | pending | success | failed
  const [lastAction, setLastAction] = useState(null);

  const runTrade = async (side) => {
    if (!token) return;
    setStatus('pending');
    setLastAction(side);
    try {
      if (side === 'buy') {
        await tradingApi.buy({
          mint_address: token.mint_address,
          amount_sol: parseFloat(amount) || 0,
          token_symbol: token.symbol,
          price: token.price,
        });
      } else {
        await tradingApi.sell({
          mint_address: token.mint_address,
          amount_sol: parseFloat(amount) || 0,
          token_symbol: token.symbol,
          price: token.price,
        });
      }
      setStatus('success');
      toast.success(`${side.toUpperCase()} executed on ${token.symbol}`);
      setTimeout(() => setStatus('idle'), 2500);
    } catch (e) {
      setStatus('failed');
      toast.error(e.message || 'Trade failed');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  if (!token) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Select a token to open trade panel
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Amount */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Buy Amount (SOL)
        </Label>
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono bg-secondary border-border pr-14"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
            SOL
          </span>
        </div>
        <div className="flex gap-1.5">
          {[0.05, 0.1, 0.5, 1].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="flex-1 h-7 text-xs font-mono rounded bg-secondary border border-border hover:border-primary/50 hover:text-primary transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Auto toggles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm">Auto-Buy</span>
          </div>
          <Switch checked={autoBuy} onCheckedChange={setAutoBuy} />
        </div>
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm">Auto-Sell</span>
          </div>
          <Switch checked={autoSell} onCheckedChange={setAutoSell} />
        </div>
      </div>

      {/* TP / SL */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Take Profit
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="font-mono bg-secondary border-border pr-8 h-9"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
              x
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Stop Loss
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="font-mono bg-secondary border-border pr-8 h-9"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          onClick={() => runTrade('buy')}
          disabled={status === 'pending'}
          className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold tracking-wide"
        >
          {status === 'pending' && lastAction === 'buy' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'BUY'
          )}
        </Button>
        <Button
          onClick={() => runTrade('sell')}
          disabled={status === 'pending'}
          className="h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-mono font-bold tracking-wide"
        >
          {status === 'pending' && lastAction === 'sell' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'SELL'
          )}
        </Button>
      </div>

      {/* Status */}
      {status !== 'idle' && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono ${
            status === 'pending'
              ? 'border-border bg-secondary text-muted-foreground'
              : status === 'success'
              ? 'border-primary/30 bg-primary/5 text-primary'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          {status === 'pending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
          <span className="uppercase tracking-wider">
            {status === 'pending' ? 'Transaction pending...' : status === 'success' ? 'Transaction confirmed' : 'Transaction failed'}
          </span>
        </div>
      )}
    </div>
  );
}