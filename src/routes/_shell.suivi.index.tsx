import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, Plus, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fmtDate, useFarm, type Fiche } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell/suivi/")({
  head: () => ({
    meta: [
      { title: "Suivi agronomique & technique — AM Grow Control" },
      {
        name: "description",
        content:
          "Centralisation des traitements phytosanitaires, apports d'engrais et suivis de plantation par zone et par culture.",
      },
      { property: "og:title", content: "Suivi agronomique & technique — AM Grow Control" },
      { property: "og:description", content: "Traitements, engrais et suivis de plantation centralisés." },
    ],
  }),
  component: SuiviPage,
});

type SortKey = "date" | "zone" | "type" | "responsable";

const TYPES: Fiche["type"][] = ["Traitement phytosanitaire", "Engrais", "Suivi de plantation"];


function SuiviPage() {
  const { fiches, zones, addFiche } = useFarm();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [zone, setZone] = useState("all");
  const [periode, setPeriode] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const zoneName = (id: string) => zones.find((z) => z.id === id)?.nom ?? "—";
  const zoneCulture = (id: string) => zones.find((z) => z.id === id)?.culture ?? "";

  // UNE SEULE source de vérité filtrée
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const now = Date.now();
    const limits: Record<string, number> = { "30": 30, "90": 90, "180": 180 };
    const out = fiches.filter((f) => {
      const zn = `${zoneName(f.zoneId)} ${zoneCulture(f.zoneId)}`.toLowerCase();
      const okQ =
        !term ||
        [f.ref, f.produit, f.type, f.responsable, f.notes, zn].some((v) => v.toLowerCase().includes(term));
      const okType = type === "all" || f.type === type;
      const okZone = zone === "all" || f.zoneId === zone;
      const okPeriode =
        periode === "all" ||
        (now - new Date(f.date).getTime()) / 86400000 <= (limits[periode] ?? 99999);
      return okQ && okType && okZone && okPeriode;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...out].sort((a, b) => {
      const av =
        sort.key === "date" ? a.date : sort.key === "zone" ? zoneName(a.zoneId) : sort.key === "type" ? a.type : a.responsable;
      const bv =
        sort.key === "date" ? b.date : sort.key === "zone" ? zoneName(b.zoneId) : sort.key === "type" ? b.type : b.responsable;
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }, [fiches, zones, q, type, zone, periode, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * perPage, current * perPage);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const reset = () => {
    setQ("");
    setType("all");
    setZone("all");
    setPeriode("all");
    setSort({ key: "date", dir: "desc" });
    setPage(1);
    toast.success("Filtres réinitialisés");
  };

  const ctl = "h-10 rounded-xl border border-border bg-card/70 px-3 text-sm outline-none focus:border-primary/60";

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Suivi agronomique & technique</h1>
          <p className="text-sm text-muted-foreground">
            Traitements, engrais et suivis de plantation — ce qui était éclaté dans Excel, centralisé ici.
          </p>
        </div>
        <NouvelleFiche open={open} setOpen={setOpen} onSubmit={addFiche} />
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher une zone, une culture, un produit…"
              className={`${ctl} w-full pl-9`}
            />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={ctl}>
            <option value="all">Tous les types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={zone} onChange={(e) => { setZone(e.target.value); setPage(1); }} className={ctl}>
            <option value="all">Toutes les zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nom}
              </option>
            ))}
          </select>
          <select value={periode} onChange={(e) => { setPeriode(e.target.value); setPage(1); }} className={ctl}>
            <option value="all">Toute la période</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="180">6 derniers mois</option>
          </select>
          <button onClick={reset} className="shine flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium">
            <RotateCcw className="h-4 w-4" /> Réinitialiser les filtres
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> fiche(s) correspondent aux
          critères · page {current} / {pageCount}
        </p>
      </div>

      <div className="glass glass-lift overflow-hidden rounded-2xl">
        <div className="overflow-x-auto scroll-green">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {(
                  [
                    ["date", "Date"],
                    ["zone", "Zone"],
                    ["type", "Type"],
                    ["responsable", "Responsable"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort(key)} className="flex items-center gap-1.5 hover:text-primary">
                      {label} <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Produit / intrant</th>
                <th className="px-4 py-3 font-medium">Quantité</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="border-t transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(f.date)}</td>
                  <td className="px-4 py-3">{zoneName(f.zoneId)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {f.type}
                    </span>
                    {f.isNew && (
                      <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                        Nouveau
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{f.responsable}</td>
                  <td className="px-4 py-3">{f.produit}</td>
                  <td className="px-4 py-3">{f.quantite}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/suivi/$ficheId"
                      params={{ ficheId: f.id }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Détail
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    Aucun résultat pour cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <label className="flex items-center gap-2">
            Lignes par page
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-border bg-card px-2"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="h-9 rounded-lg border border-border px-3 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-muted-foreground">
              {current} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={current === pageCount}
              className="h-9 rounded-lg border border-border px-3 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NouvelleFiche({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSubmit: ReturnType<typeof useFarm>["addFiche"];
}) {
  const { zones } = useFarm();
  const [form, setForm] = useState({
    zoneId: zones[0]?.id ?? "",
    type: TYPES[0] as Fiche["type"],
    date: new Date().toISOString().slice(0, 10),
    produit: "",
    quantite: "",
    responsable: "",
    notes: "",
  });

  const ctl = "h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary/60";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="shine flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Ajouter une fiche de suivi
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Nouvelle fiche de suivi</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Zone</span>
            <select className={ctl} value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Type</span>
            <select
              className={ctl}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Fiche["type"] })}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Date</span>
            <input type="date" className={ctl} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Produit / intrant</span>
            <input className={ctl} value={form.produit} onChange={(e) => setForm({ ...form, produit: e.target.value })} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Quantité</span>
            <input className={ctl} value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium">Responsable</span>
            <input
              className={ctl}
              value={form.responsable}
              onChange={(e) => setForm({ ...form, responsable: e.target.value })}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <textarea
              className="min-h-20 w-full rounded-lg border border-border bg-background/80 p-3 text-sm outline-none focus:border-primary/60"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>
        <button
          onClick={() => {
            if (!form.produit.trim()) {
              toast.error("Indiquez le produit ou l'intervention");
              return;
            }
            onSubmit({ ...form, responsable: form.responsable || "M. Amin" });
            setOpen(false);
            setForm({ ...form, produit: "", quantite: "", notes: "" });
            toast.success("Fiche de suivi ajoutée");
          }}
          className="shine mt-2 h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          Valider la fiche
        </button>
      </DialogContent>
    </Dialog>
  );
}
