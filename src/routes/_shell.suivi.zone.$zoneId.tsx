import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { fmtDate, fmtMAD, useFarm, type Fiche } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell/suivi/zone/$zoneId")({
  head: () => ({
    meta: [
      { title: "Journal de la zone — AM Grow Control" },
      {
        name: "description",
        content:
          "Journal chronologique d'une zone : traitements, apports d'engrais, suivis de plantation et budget consommé.",
      },
      { property: "og:title", content: "Journal de la zone — AM Grow Control" },
      { property: "og:description", content: "Tout l'historique agronomique d'une parcelle, au même endroit." },
    ],
  }),
  component: ZonePage,
});

const dot: Record<Fiche["type"], string> = {
  "Traitement phytosanitaire": "bg-warning",
  "Apport d'engrais": "bg-primary",
  "Suivi de plantation": "bg-sky-500",
};

function ZonePage() {
  const { zoneId } = useParams({ from: "/_shell/suivi/zone/$zoneId" });
  const { zones, fiches, ficheDar, zoneBudget, zoneConsomme, zoneNiveau } = useFarm();
  const zone = zones.find((z) => z.id === zoneId);

  if (!zone) {
    return (
      <div className="glass mx-auto max-w-xl rounded-2xl p-10 text-center">
        <p className="text-muted-foreground">Cette zone est introuvable.</p>
        <Link to="/suivi" className="mt-4 inline-block font-medium text-primary hover:underline">
          Retour au suivi
        </Link>
      </div>
    );
  }

  const ficheZone = fiches
    .filter((f) => f.zoneId === zone.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const mois = new Date().getMonth();
  const traitementsMois = ficheZone.filter(
    (f) => f.type === "Traitement phytosanitaire" && new Date(f.date).getMonth() === mois,
  ).length;
  const doseEngrais = ficheZone
    .filter((f) => f.type === "Apport d'engrais")
    .reduce((s, f) => s + (parseFloat(f.quantite) || 0), 0);
  const dernierStade = ficheZone.find((f) => f.type === "Suivi de plantation")?.stade ?? "—";
  const dars = ficheZone.map(ficheDar).filter(Boolean);
  const niveau = zoneNiveau(zone.id);

  const kpis = [
    ["Traitements ce mois", String(traitementsMois)],
    ["Dose totale d'engrais", `${doseEngrais.toFixed(0)} kg`],
    ["Dernier stade phénologique", dernierStade],
    ["Budget consommé", `${fmtMAD(zoneConsomme(zone.id))} / ${fmtMAD(zoneBudget(zone.id))}`],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/suivi" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Suivi agronomique
      </Link>

      <div className="glass glass-lift rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">{zone.nom}</h1>
            <p className="text-sm text-muted-foreground">
              {zone.culture} · {zone.famille} · {zone.superficie} ha · {zone.responsable}
            </p>
          </div>
          {niveau !== "ok" && (
            <span
              className={`alert-pulse rounded-full px-3 py-1.5 text-xs font-semibold ${
                niveau === "rouge" ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-accent-foreground"
              }`}
            >
              {niveau === "rouge" ? "Budget dépassé" : "Seuil d'alerte budgétaire"}
            </span>
          )}
        </div>

        {dars.length > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-destructive">
              Récolte à ne pas anticiper avant le {fmtDate(dars[0]!.dateLimite)} — délai avant récolte en cours
              (récolte prévue le {fmtDate(dars[0]!.recolte)}).
            </p>
          </div>
        )}

        <dl className="mt-5 grid gap-4 sm:grid-cols-4">
          {kpis.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="glass glass-lift rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Journal chronologique de la zone</h2>
        <p className="text-sm text-muted-foreground">
          Tous les traitements, apports et suivis réalisés sur cette parcelle depuis le début.
        </p>
        <div className="mt-5 space-y-4">
          {ficheZone.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.05 }}
              className="relative border-l-2 border-primary/25 pl-5"
            >
              <span className={`absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full ${dot[f.type]}`} />
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{f.type}</p>
                <span className="text-xs text-muted-foreground">{fmtDate(f.date)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {f.produit}
                {f.quantite !== "—" ? ` · ${f.quantite}` : ""}
                {f.cible ? ` · cible : ${f.cible}` : ""}
                {f.stade ? ` · stade : ${f.stade}` : ""}
              </p>
              <Link
                to="/suivi/$ficheId"
                params={{ ficheId: f.id }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Ouvrir la fiche {f.ref}
              </Link>
            </motion.div>
          ))}
          {ficheZone.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucune intervention enregistrée sur cette zone pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
