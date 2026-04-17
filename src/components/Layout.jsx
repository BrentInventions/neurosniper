import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, Wallet, History, Settings, Zap, Radio, Bot } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Terminal', icon: Activity },
  { to: '/positions', label: 'Positions', icon: Wallet },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Strategy', icon: Settings },
  { to: '/research', label: 'Research', icon: Bot },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/30 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-5 h-5 text-primary" strokeWidth={2.5} />
                <div className="absolute inset-0 blur-md bg-primary/40 -z-10" />
              </div>
              <span className="font-mono font-bold text-lg tracking-tight">
                NEURO<span className="text-primary">SNIPER</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 h-8 rounded-md bg-secondary border border-border">
              <Radio className="w-3.5 h-3.5 text-primary pulse-dot" />
              <span className="text-xs font-mono text-muted-foreground">LIVE</span>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-2 pb-2 overflow-x-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}