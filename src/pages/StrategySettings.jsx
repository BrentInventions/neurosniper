import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Crosshair, Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

const RISK_LEVELS = [
  { value: 'safe', label: 'SAFE', icon: Shield, desc: 'Conservative filters, verified tokens only' },
  { value: 'aggressive', label: 'AGGRESSIVE', icon: Zap, desc: 'Balanced risk/reward, faster entries' },
  { value: 'sniper', label: 'SNIPER', icon: Crosshair, desc: 'Ultra-fast, brand-new launches only' },
];

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

export default function StrategySettings() {
  const [strategy, setStrategy] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Strategy.list('-created_date', 1);
      if (list.length > 0) {
        setStrategy(list[0]);
      } else {
        const created = await base44.entities.Strategy.create({
          name: 'Default Strategy',
          buy_amount_sol: 0.1,
          auto_buy: false,
          auto_sell: true,
          take_profit_multiplier: 2,
          stop_loss_percent: 30,
          min_market_cap: 10000,
          max_market_cap: 500000,
          min_liquidity: 5000,
          max_token_age_seconds: 120,
          risk_level: 'aggressive',
          is_active: true,
        });
        setStrategy(created);
      }
    })();
  }, []);

  const update = (patch) => setStrategy((s) => ({ ...s, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const { id, created_date, updated_date, created_by, ...data } = strategy;
      await base44.entities.Strategy.update(id, data);
      toast.success('Strategy saved');
    } catch (e) {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  if (!strategy) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Loading strategy...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Strategy Configuration</div>
            <div className="text-xs text-muted-foreground">Tune filters and auto-trade behavior</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Bot</span>
            <Switch
              checked={strategy.is_active}
              onCheckedChange={(v) => update({ is_active: v })}
            />
            <span className={`text-xs font-mono ${strategy.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
              {strategy.is_active ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Risk level */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Risk Profile</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {RISK_LEVELS.map(({ value, label, icon: Icon, desc }) => {
            const active = strategy.risk_level === value;
            return (
              <button
                key={value}
                onClick={() => update({ risk_level: value })}
                className={`text-left p-3 rounded-md border transition-all ${
                  active
                    ? 'border-primary bg-primary/5 glow-green'
                    : 'border-border bg-secondary/50 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-mono text-xs font-bold tracking-wider ${active ? 'text-primary' : ''}`}>
                    {label}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground leading-snug">{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trade settings */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Trade Behavior</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Buy Amount (SOL)">
            <Input
              type="number"
              step="0.01"
              value={strategy.buy_amount_sol}
              onChange={(e) => update({ buy_amount_sol: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
          <Field label="Take Profit (x multiplier)">
            <Input
              type="number"
              step="0.1"
              value={strategy.take_profit_multiplier}
              onChange={(e) => update({ take_profit_multiplier: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
          <Field label="Stop Loss (%)">
            <Input
              type="number"
              value={strategy.stop_loss_percent}
              onChange={(e) => update({ stop_loss_percent: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
          <Field label="Max Token Age (seconds)" hint="Only buy tokens younger than this">
            <Input
              type="number"
              value={strategy.max_token_age_seconds}
              onChange={(e) => update({ max_token_age_seconds: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border">
            <div>
              <div className="text-sm font-medium">Auto-Buy</div>
              <div className="text-[11px] text-muted-foreground">Automatically snipe tokens matching filters</div>
            </div>
            <Switch checked={strategy.auto_buy} onCheckedChange={(v) => update({ auto_buy: v })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border">
            <div>
              <div className="text-sm font-medium">Auto-Sell</div>
              <div className="text-[11px] text-muted-foreground">Exit at TP / SL automatically</div>
            </div>
            <Switch checked={strategy.auto_sell} onCheckedChange={(v) => update({ auto_sell: v })} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Token Filters</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Min Market Cap ($)">
            <Input
              type="number"
              value={strategy.min_market_cap}
              onChange={(e) => update({ min_market_cap: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
          <Field label="Max Market Cap ($)">
            <Input
              type="number"
              value={strategy.max_market_cap}
              onChange={(e) => update({ max_market_cap: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
          <Field label="Min Liquidity ($)">
            <Input
              type="number"
              value={strategy.min_liquidity}
              onChange={(e) => update({ min_liquidity: parseFloat(e.target.value) || 0 })}
              className="font-mono bg-secondary border-border"
            />
          </Field>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end sticky bottom-4">
        <Button
          onClick={save}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold tracking-wide px-8 h-11 glow-green"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'SAVING...' : 'SAVE STRATEGY'}
        </Button>
      </div>
    </div>
  );
}