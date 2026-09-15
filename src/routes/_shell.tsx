import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Search,
  Settings,
  Sprout,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Aurora } from "@/components/Aurora";
import { Logo, LogoMark } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FarmProvider, useFarm } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

const NAV = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/configuration", label: "Configuration", icon: Settings },
  { to: "/suivi", label: "Suivi agronomique & technique", icon: Sprout },
  { to: "/analytique", label: "Analytique & Budget", icon: LineChart },
] as const;

function ShellLayout() {
  return (
    <FarmProvider>
      <TooltipProvider delayDuration={120}>
        <Shell />
      </TooltipProvider>
    </FarmProvider>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-2">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        const link = (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            } ${collapsed ? "justify-center" : ""}`}
          >
            {active && (
              <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
            )}
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          link
        );
      })}
    </nav>
  );
}

function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen">
      <Aurora />

      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl transition-[width] duration-200 ease-out md:flex"
        style={{ width: collapsed ? 64 : 260 }}
      >
        <div className="flex h-20 items-center justify-center px-3">
          {collapsed ? <LogoMark className="h-8 w-8" /> : <Logo className="h-14 w-auto" />}
        </div>
        <div className="flex-1 overflow-y-auto py-2 scroll-green">
          <NavList collapsed={collapsed} />
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="m-2 flex items-center justify-center gap-2 rounded-xl border border-border/70 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Réduire</span>}
        </button>
      </aside>

      <div
        className="transition-[margin] duration-200 ease-out"
        style={{ marginLeft: undefined }}
      >
        <div className="md:ml-[var(--sb)] transition-[margin] duration-200 ease-out" style={{ ["--sb" as string]: `${collapsed ? 64 : 260}px` }}>
          <Header />
          <main className="px-4 pb-24 md:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { zones, fiches, activites, alertes } = useFarm();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [seen, setSeen] = useState(false);

  const unread = useMemo(() => alertes.length + 2, [alertes.length]);

  const go = () => {
    const term = q.trim().toLowerCase();
    if (!term) return;
    const fiche = fiches.find(
      (f) => f.ref.toLowerCase().includes(term) || f.produit.toLowerCase().includes(term),
    );
    if (fiche) {
      navigate({ to: "/suivi/$ficheId", params: { ficheId: fiche.id } });
      setQ("");
      return;
    }
    const zone = zones.find((z) => z.nom.toLowerCase().includes(term));
    if (zone) {
      navigate({ to: "/configuration" });
      toast.success(`Zone trouvée : ${zone.nom} — onglet Zones & Cultures`);
      setQ("");
      return;
    }
    toast.error("Aucune zone ni fiche ne correspond à cette référence.");
  };

  return (
    <header className="sticky top-0 z-20 mb-6 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <button className="rounded-lg p-2 hover:bg-muted md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[270px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-20 items-center justify-center">
            <Logo className="h-14 w-auto" />
          </div>
          <NavList collapsed={false} />
        </SheetContent>
      </Sheet>

      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Aller à… (réf. fiche FS-2026-004 ou zone Serre A1)"
          className="h-10 w-full rounded-xl border border-border/70 bg-card/70 pr-3 pl-9 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <Popover onOpenChange={(o) => o && setSeen(true)}>
        <PopoverTrigger asChild>
          <button className="relative rounded-xl p-2 transition-colors hover:bg-muted" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {!seen && unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground alert-pulse">
                {unread}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="border-b px-4 py-3 text-sm font-semibold">Dernières activités</div>
          <div className="max-h-72 overflow-y-auto scroll-green">
            {activites.slice(0, 7).map((a) => (
              <div key={a.id} className="border-b px-4 py-2.5 text-sm last:border-0">
                <p className="text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl py-1.5 pr-3 pl-1.5 transition-colors hover:bg-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              MA
            </span>
            <span className="hidden text-left text-sm leading-tight sm:block">
              <span className="block font-medium">M. Amin</span>
              <span className="block text-xs text-muted-foreground">AM Grow</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.info("Profil — M. Amin, AM Grow")}>
            <User className="mr-2 h-4 w-4" /> Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/" })}>
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
