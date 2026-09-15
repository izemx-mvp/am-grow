import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ClipboardList, RefreshCw, Settings2, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CountUp } from "@/components/CountUp";
import { fmtMAD, fmtTime, useFarm } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — AM Grow Control" },
      {
        name: "description",
        content: "Vue d'ensemble du budget consommé, des alertes par zone et de l'activité agronomique récente.",
      },
      { property: "og:title", content: "Tableau de bord — AM Grow Control" },
      { property: "og:description", content: "Budget, alertes et activité agronomique de la ferme AM Grow." },
    ],
  }),
  component: DashboardPage,
});

const MOIS = ["Avr", "Mai", "Juin", "Juil", "Août", "Sept"];

function DashboardPage() {
  const { zones, fiches, depenses, alertes, configValidee, lastSync, zoneConsomme, activites } = useFarm();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const navigate = useNavigate();

  const totalConsomme = depenses.reduce((s, d) => s + d.montant, 0);
  const critiques = alertes.filter((a) => a.niveau === "rouge").length;

  const chartData = MOIS.map((m, i) => {
    const row: Record<string, string | number> = { mois: m };
    zones.forEach((z, zi) => {
      const base = zoneConsomme(z.id) / 6;
      row[z.nom] = Math.round(base * (0.7 + ((i * 7 + zi * 3) % 10) / 14));
    });
    return row;
  });

  const palette = ["var(--primary)", "var(--primary-glow)", "var(--accent)", "var(--accent-glow)", "var(--muted-foreground)"];

  const kpis = [
    {
      label: "Budget consommé ce mois",
      value: totalConsomme,
      suffix: " MAD",
      icon: Wallet,
      to: "/analytique" as const,
    },
    { label: "Alertes budgétaires actives", value: alertes.length, icon: AlertTriangle, to: "/analytique" as const },
    { label: "Fiches de suivi ce mois", value: fiches.length, icon: ClipboardList, to: "/suivi" as const },
    { label: "Zones sous seuil critique", value: critiques, icon: TrendingUp, to: "/analytique" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          AM Grow — Sidi Ouassay · {zones.length} zones suivies · comptabilité synchronisée depuis Zoho Books
        </p>
      </div>

      {!configValidee && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/50 bg-accent-soft px-5 py-4"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
            <AlertTriangle className="h-4 w-4" />
            Configurez vos zones et vos seuils budgétaires avant de commencer le suivi.
          </p>
          <button
            onClick={() => navigate({ to: "/configuration" })}
            className="shine flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Settings2 className="h-4 w-4" /> Configurer
          </button>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link to={k.to} className="glass glass-lift block h-full rounded-2xl p-5">
              <k.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-bold">
                <CountUp value={k.value} suffix={k.suffix ?? ""} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{k.label}</p>
            </Link>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <Link to="/configuration" className="glass glass-lift glass-gold block h-full rounded-2xl p-5">
            <RefreshCw className="h-5 w-5 text-accent-foreground" />
            <p className="mt-3 font-display text-xl font-bold">{fmtTime(lastSync)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Dernière synchro Zoho Books</p>
          </Link>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass glass-lift rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Budget consommé par zone — 6 derniers mois</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} />
                <RTooltip
                  formatter={(v: number) => fmtMAD(v)}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {zones.map((z, i) => (
                  <Bar key={z.id} dataKey={z.nom} stackId="a" fill={palette[i % palette.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass glass-lift rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Activité récente</h2>
          <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-2 scroll-green">
            {activites.map((a) => (
              <div key={a.id} className="relative border-l-2 border-primary/25 pl-4">
                <span className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-accent" />
                <p className="text-sm">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
