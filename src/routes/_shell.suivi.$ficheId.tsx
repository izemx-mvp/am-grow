import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fmtDate, fmtMAD, useFarm, type Depense } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell/suivi/$ficheId")({
  head: () => ({
    meta: [
      { title: "Détail de la fiche de suivi — AM Grow Control" },
      {
        name: "description",
        content: "Détail d'une intervention agronomique : produit, quantité, historique et dépenses associées.",
      },
      { property: "og:title", content: "Détail de la fiche de suivi — AM Grow Control" },
      { property: "og:description", content: "Intervention agronomique détaillée et dépenses rattachées." },
    ],
  }),
  component: FicheDetail,
});

function FicheDetail() {
  const { ficheId } = useParams({ from: "/_shell/suivi/$ficheId" });
  const { fiches, zones, depenses, addDepense } = useFarm();
  const fiche = fiches.find((f) => f.id === ficheId);

  if (!fiche) {
    return (
      <div className="glass mx-auto max-w-xl rounded-2xl p-10 text-center">
        <p className="text-muted-foreground">Cette fiche de suivi est introuvable.</p>
        <Link to="/suivi" className="mt-4 inline-block font-medium text-primary hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const zone = zones.find((z) => z.id === fiche.zoneId);
  const liees = depenses.filter((d) => d.ficheId === fiche.id);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/suivi" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Suivi agronomique
      </Link>

      <div className="glass glass-lift rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{fiche.ref}</p>
            <h1 className="font-display text-2xl font-bold">
              {fiche.type} — {fiche.produit}
            </h1>
          </div>
          <AssocierDepense
            zoneId={fiche.zoneId}
            ficheId={fiche.id}
            onAdd={(d) => {
              addDepense(d);
              toast.success("Dépense associée — totaux de la zone mis à jour");
            }}
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Date", fmtDate(fiche.date)],
            ["Zone", zone?.nom ?? "—"],
            ["Culture", zone?.culture ?? "—"],
            ["Quantité", fiche.quantite],
            ["Responsable", fiche.responsable],
            ["Dépenses associées", fmtMAD(liees.reduce((s, d) => s + d.montant, 0))],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-sm text-muted-foreground">{fiche.notes}</p>

        <Link
          to="/configuration"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <MapPin className="h-4 w-4" /> Voir la zone {zone?.nom} dans le référentiel
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass glass-lift rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Historique des modifications</h2>
          <div className="mt-4 space-y-4">
            {fiche.historique.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative border-l-2 border-primary/25 pl-4"
              >
                <span className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-accent" />
                <p className="text-sm font-medium">{h.label}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(h.date)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass glass-lift rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Dépenses rattachées</h2>
          {liees.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune dépense associée pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {liees.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  <span>
                    {d.libelle} · <span className="text-muted-foreground">{d.categorie}</span>
                  </span>
                  <span className="font-semibold">{fmtMAD(d.montant)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/analytique" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Voir l'analytique de la zone
          </Link>
        </div>
      </div>
    </div>
  );
}

function AssocierDepense({
  zoneId,
  ficheId,
  onAdd,
}: {
  zoneId: string;
  ficheId: string;
  onAdd: (d: Omit<Depense, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [montant, setMontant] = useState(3500);
  const [categorie, setCategorie] = useState<Depense["categorie"]>("Intrants");
  const [libelle, setLibelle] = useState("Achat d'intrants liés à l'intervention");
  const ctl = "h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary/60";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="shine flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <Wallet className="h-4 w-4" /> Associer une dépense
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Associer une dépense</DialogTitle>
        </DialogHeader>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Libellé</span>
          <input className={ctl} value={libelle} onChange={(e) => setLibelle(e.target.value)} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Catégorie</span>
          <select
            className={ctl}
            value={categorie}
            onChange={(e) => setCategorie(e.target.value as Depense["categorie"])}
          >
            <option>Intrants</option>
            <option>Main d'œuvre</option>
            <option>Équipement</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Montant (MAD)</span>
          <input type="number" className={ctl} value={montant} onChange={(e) => setMontant(Number(e.target.value))} />
        </label>
        <button
          onClick={() => {
            onAdd({
              date: new Date().toISOString().slice(0, 10),
              zoneId,
              categorie,
              libelle,
              montant,
              ficheId,
            });
            setOpen(false);
          }}
          className="shine mt-2 h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          Valider l'association
        </button>
      </DialogContent>
    </Dialog>
  );
}
