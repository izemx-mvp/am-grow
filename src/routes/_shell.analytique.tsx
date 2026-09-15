import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Download, Eye, FileText, Loader2, Send, Sparkles, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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
import { toast } from "sonner";

import { CountUp } from "@/components/CountUp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmtDate, fmtMAD, useFarm, type Rapport } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell/analytique")({
  head: () => ({
    meta: [
      { title: "Analytique & Budget — AM Grow Control" },
      {
        name: "description",
        content:
          "Affectation des dépenses par zone et par culture, suivi des budgets, alertes et assistant IA d'analyse.",
      },
      { property: "og:title", content: "Analytique & Budget — AM Grow Control" },
      { property: "og:description", content: "Allocation des dépenses par zone, budgets et assistant IA." },
    ],
  }),
  component: AnalytiquePage,
});

const CATS = ["Intrants", "Main d'œuvre", "Équipement"] as const;

function AnalytiquePage() {
  const farm = useFarm();
  const { zones, depenses, fiches, rapports, addRapport, zoneBudget, zoneConsomme, zoneNiveau } = farm;

  const [zoneSel, setZoneSel] = useState("all");
  const [catSel, setCatSel] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("");
  const [preview, setPreview] = useState<Rapport | null>(null);

  const zoneName = (id: string) => zones.find((z) => z.id === id)?.nom ?? "—";

  const filtered = useMemo(
    () =>
      depenses.filter(
        (d) => (zoneSel === "all" || d.zoneId === zoneSel) && (catSel === "all" || d.categorie === catSel),
      ),
    [depenses, zoneSel, catSel],
  );

  const total = filtered.reduce((s, d) => s + d.montant, 0);

  const chartData = zones
    .filter((z) => zoneSel === "all" || z.id === zoneSel)
    .map((z) => {
      const row: Record<string, string | number> = { zone: z.nom };
      CATS.forEach((c) => {
        row[c] = filtered.filter((d) => d.zoneId === z.id && d.categorie === c).reduce((s, d) => s + d.montant, 0);
      });
      return row;
    });

  const selBudget = zoneSel === "all" ? zones.reduce((s, z) => s + zoneBudget(z.id), 0) : zoneBudget(zoneSel);
  const selConso = zoneSel === "all" ? zones.reduce((s, z) => s + zoneConsomme(z.id), 0) : zoneConsomme(zoneSel);
  const selPct = selBudget ? Math.round((selConso / selBudget) * 100) : 0;
  const selNiveau =
    selPct >= farm.seuilRouge ? "rouge" : selPct >= farm.seuilOrange ? "orange" : "ok";
  const barColor =
    selNiveau === "rouge" ? "bg-destructive" : selNiveau === "orange" ? "bg-warning" : "bg-primary";

  const generer = () => {
    setGenerating(true);
    setStep("Récupération des dépenses…");
    setTimeout(() => setStep("Calcul par zone…"), 700);
    setTimeout(() => setStep("Génération du rapport…"), 1400);
    setTimeout(() => {
      addRapport({
        titre: `Rapport budgétaire — ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
        date: new Date().toISOString().slice(0, 10),
        total,
        lignes: filtered.length,
        zones: zoneSel === "all" ? zones.length : 1,
      });
      setGenerating(false);
      setStep("");
      toast.success("Rapport du mois généré");
    }, 2100);
  };

  const telecharger = (r: Rapport) => {
    const contenu = [
      `${r.titre}`,
      `Généré le ${fmtDate(r.date)}`,
      `Lignes analysées : ${r.lignes}`,
      `Zones couvertes : ${r.zones}`,
      `Total : ${fmtMAD(r.total)}`,
      "",
      ...zones.map((z) => `${z.nom} — consommé ${fmtMAD(zoneConsomme(z.id))} / budget ${fmtMAD(zoneBudget(z.id))}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([contenu], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.titre.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport téléchargé");
  };

  const ctl = "h-10 rounded-xl border border-border bg-card/70 px-3 text-sm outline-none focus:border-primary/60";

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Analytique & Budget</h1>
        <p className="text-sm text-muted-foreground">
          Chaque achat et chaque consommation affectés à leur zone, leur parcelle et leur culture.
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <select value={zoneSel} onChange={(e) => setZoneSel(e.target.value)} className={ctl}>
            <option value="all">Toutes les zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nom}
              </option>
            ))}
          </select>
          <select value={catSel} onChange={(e) => setCatSel(e.target.value)} className={ctl}>
            <option value="all">Toutes les catégories</option>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> ligne(s) ·{" "}
            <span className="font-semibold text-foreground">{fmtMAD(total)}</span>
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {zoneSel === "all" ? "Toutes les zones" : zoneName(zoneSel)} — {selPct}% du budget consommé
            </span>
            <span className="text-muted-foreground">
              {fmtMAD(selConso)} / {fmtMAD(selBudget)}
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.min(100, selPct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass glass-lift rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Répartition par zone et catégorie</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="zone" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={60} />
                <RTooltip formatter={(v: number) => fmtMAD(v)} contentStyle={{ borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Intrants" stackId="a" fill="var(--primary)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Main d'œuvre" stackId="a" fill="var(--primary-glow)" />
                <Bar dataKey="Équipement" stackId="a" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass glass-lift rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Suivi budgétaire par zone</h2>
          <div className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-2 scroll-green">
            {zones.map((z) => {
              const b = zoneBudget(z.id);
              const c = zoneConsomme(z.id);
              const pct = b ? Math.round((c / b) * 100) : 0;
              const n = zoneNiveau(z.id);
              return (
                <div key={z.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{z.nom}</span>
                    <span className="flex items-center gap-2">
                      {n !== "ok" && (
                        <span
                          className={`alert-pulse rounded-full px-2 py-0.5 text-xs font-semibold ${
                            n === "rouge"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-warning/20 text-accent-foreground"
                          }`}
                        >
                          {n === "rouge" ? "Seuil critique" : "Seuil d'alerte"}
                        </span>
                      )}
                      <span className="text-muted-foreground">{pct}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        n === "rouge" ? "bg-destructive" : n === "orange" ? "bg-warning" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass glass-lift overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Allocation des dépenses</h2>
          <p className="font-display text-lg font-bold">
            <CountUp value={total} suffix=" MAD" />
          </p>
        </div>
        <div className="overflow-x-auto scroll-green">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Zone / culture</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Fiche d'origine</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const z = zones.find((x) => x.id === d.zoneId);
                const f = fiches.find((x) => x.id === d.ficheId);
                return (
                  <tr key={d.id} className="border-t transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(d.date)}</td>
                    <td className="px-4 py-3">
                      {z?.nom} <span className="text-muted-foreground">· {z?.culture}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {d.categorie}
                      </span>
                    </td>
                    <td className="px-4 py-3">{d.libelle}</td>
                    <td className="px-4 py-3 font-semibold">{fmtMAD(d.montant)}</td>
                    <td className="px-4 py-3">
                      {f ? (
                        <Link
                          to="/suivi/$ficheId"
                          params={{ ficheId: f.id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {f.ref}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    Aucun résultat pour cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass glass-lift rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Rapports générés</h2>
          <button
            onClick={generer}
            disabled={generating}
            className="shine flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Générer le rapport du mois
          </button>
        </div>

        {generating && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-primary">{step}</p>
            <div className="shimmer h-12 w-full" />
            <div className="shimmer h-12 w-3/4" />
          </div>
        )}

        {rapports.length === 0 && !generating ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun rapport pour l'instant — générez le rapport du mois pour le retrouver ici.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rapports.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{r.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(r.date)} · {r.lignes} lignes · {r.zones} zones · {fmtMAD(r.total)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(r)}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 font-medium"
                  >
                    <Eye className="h-4 w-4" /> Aperçu
                  </button>
                  <button
                    onClick={() => telecharger(r)}
                    className="shine flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 font-medium text-primary-foreground"
                  >
                    <Download className="h-4 w-4" /> Télécharger
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{preview?.titre}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {fmtDate(preview.date)} · {preview.lignes} lignes · {preview.zones} zones
              </p>
              <p className="font-display text-2xl font-bold">{fmtMAD(preview.total)}</p>
              <ul className="mt-2 space-y-1">
                {zones.map((z) => (
                  <li key={z.id} className="flex justify-between border-b py-1 last:border-0">
                    <span>{z.nom}</span>
                    <span className="text-muted-foreground">
                      {fmtMAD(zoneConsomme(z.id))} / {fmtMAD(zoneBudget(z.id))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AssistantIA />
    </div>
  );
}

const SUGGESTIONS = [
  "Quelle zone consomme le plus ce mois-ci ?",
  "Y a-t-il des alertes budgétaires actives ?",
  "Quel est le budget restant sur la Serre A1 ?",
  "Résume la répartition des dépenses par catégorie",
];

function AssistantIA() {
  const farm = useFarm();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Bonjour M. Amin 👋 Je peux analyser vos dépenses par zone, vos budgets et vos alertes. Posez-moi une question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const send = (question: string) => {
    const q = question.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(
      () => {
        setMsgs((m) => [...m, { role: "ai", text: getAssistantReply(q, farm) }]);
        setTyping(false);
        requestAnimationFrame(() => boxRef.current?.scrollTo({ top: 99999, behavior: "smooth" }));
      },
      800 + Math.random() * 400,
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glow-pulse fixed right-6 bottom-6 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        <Bot className="h-5 w-5" /> Demander à l'assistant IA
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-border bg-card/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-4">
              <p className="flex items-center gap-2 font-display font-semibold">
                <Sparkles className="h-4 w-4 text-accent" /> Assistant IA AM Grow
              </p>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-muted" aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto p-4 scroll-green">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {typing && <div className="w-32 text-xs text-muted-foreground">L'assistant écrit…</div>}
              {msgs.length === 1 && (
                <div className="space-y-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full rounded-xl border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Posez votre question…"
                className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
              />
              <button
                onClick={() => send(input)}
                className="shine flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function getAssistantReply(question: string, data: ReturnType<typeof useFarm>): string {
  const q = question.toLowerCase();
  const { zones, depenses, alertes, zoneBudget, zoneConsomme } = data;

  const zoneMatch = zones.find((z) => q.includes(z.nom.toLowerCase()));
  if (zoneMatch) {
    const b = zoneBudget(zoneMatch.id);
    const c = zoneConsomme(zoneMatch.id);
    return `${zoneMatch.nom} (${zoneMatch.culture}) : ${fmtMAD(c)} consommés sur un budget de ${fmtMAD(b)}, soit ${Math.round((c / b) * 100)}%. Budget restant : ${fmtMAD(Math.max(0, b - c))}.`;
  }
  if (q.includes("alerte") || q.includes("seuil") || q.includes("critique")) {
    if (alertes.length === 0) return "Aucune alerte budgétaire active : toutes les zones sont sous les seuils configurés.";
    return `${alertes.length} alerte(s) active(s) : ${alertes.map((a) => `${a.nom} à ${a.pct}% (${a.niveau})`).join(", ")}.`;
  }
  if (q.includes("catégorie") || q.includes("categorie") || q.includes("répartition") || q.includes("repartition")) {
    const parts = CATS.map((c) => {
      const t = depenses.filter((d) => d.categorie === c).reduce((s, d) => s + d.montant, 0);
      return `${c} : ${fmtMAD(t)}`;
    });
    return `Répartition des dépenses par catégorie — ${parts.join(" · ")}.`;
  }
  if (q.includes("plus") || q.includes("consomme") || q.includes("top")) {
    const sorted = [...zones].sort((a, b) => zoneConsomme(b.id) - zoneConsomme(a.id));
    const top = sorted[0];
    if (!top) return "Aucune zone n'est encore définie dans la configuration.";
    return `La zone qui consomme le plus est ${top.nom} avec ${fmtMAD(zoneConsomme(top.id))} de dépenses affectées ce mois-ci.`;
  }
  if (q.includes("budget") || q.includes("restant")) {
    const b = zones.reduce((s, z) => s + zoneBudget(z.id), 0);
    const c = zones.reduce((s, z) => s + zoneConsomme(z.id), 0);
    return `Budget global : ${fmtMAD(b)}, consommé ${fmtMAD(c)} (${Math.round((c / b) * 100)}%). Reste ${fmtMAD(Math.max(0, b - c))}.`;
  }
  if (q.includes("zoho")) {
    return "La comptabilité reste gérée dans Zoho Books ; la dernière synchronisation a bien été récupérée et alimente l'allocation par zone.";
  }
  const totalG = depenses.reduce((s, d) => s + d.montant, 0);
  return `Sur l'ensemble des ${zones.length} zones, ${depenses.length} lignes de dépenses ont été affectées pour ${fmtMAD(totalG)}. Demandez-moi une zone précise, les alertes actives ou la répartition par catégorie.`;
}
