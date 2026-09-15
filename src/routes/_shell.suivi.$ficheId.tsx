import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ImageIcon, MapPin, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, fmtDate, fmtMAD, useFarm, type Categorie, type Depense, type Fiche } from "@/lib/farm-store";

export const Route = createFileRoute("/_shell/suivi/$ficheId")({
  head: () => ({
    meta: [
      { title: "Détail de la fiche de suivi — AM Grow Control" },
      {
        name: "description",
        content: "Détail d'une intervention agronomique : produit, dose, délai avant récolte et dépenses associées.",
      },
      { property: "og:title", content: "Détail de la fiche de suivi — AM Grow Control" },
      { property: "og:description", content: "Intervention agronomique détaillée et dépenses rattachées." },
    ],
  }),
  component: FicheDetail,
});

const categorieDe = (t: Fiche["type"]): Categorie =>
  t === "Traitement phytosanitaire" ? "Intrants phytosanitaires" : t === "Apport d'engrais" ? "Engrais" : "Main d'œuvre";

const etatColor: Record<string, string> = {
  Bon: "bg-primary/10 text-primary",
  Moyen: "bg-warning/20 text-accent-foreground",
  "À surveiller": "bg-destructive/10 text-destructive",
};

function FicheDetail() {
  const { ficheId } = useParams({ from: "/_shell/suivi/$ficheId" });
  const { fiches, zones, depenses, addDepense, ficheDar } = useFarm();
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
  const dar = ficheDar(fiche);
  const autres = fiches.filter((f) => f.zoneId === fiche.zoneId && f.id !== fiche.id);

  const champs: [string, string][] = [
    ["Date", `${fmtDate(fiche.date)}${fiche.heure ? ` à ${fiche.heure}` : ""}`],
    ["Zone", zone?.nom ?? "—"],
    ["Culture", zone?.culture ?? "—"],
    ["Responsable", fiche.responsable],
  ];
  if (fiche.type === "Traitement phytosanitaire") {
    champs.push(
      ["Produit", fiche.produit],
      ["Matière active", fiche.matiereActive ?? "—"],
      ["Cible", fiche.cible ?? "—"],
      ["Dose", fiche.quantite],
      ["Méthode", fiche.methode ?? "—"],
      ["DAR — délai avant récolte", fiche.dar ? `${fiche.dar} jours` : "—"],
    );
  } else if (fiche.type === "Apport d'engrais") {
    champs.push(
      ["Engrais", fiche.produit],
      ["Type", fiche.typeEngrais ?? "—"],
      ["Dose", fiche.quantite],
      ["Méthode", fiche.methode ?? "—"],
      ["Stade de la culture", fiche.stadeCulture ?? "—"],
    );
  } else {
    champs.push(
      ["Stade phénologique", fiche.stade ?? "—"],
      ["État sanitaire", fiche.etatSanitaire ?? "—"],
      ["Photos", `${fiche.photos?.length ?? 0} photo(s)`],
    );
  }
  champs.push(["Dépenses associées", fmtMAD(liees.reduce((s, d) => s + d.montant, 0))]);

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
            {fiche.etatSanitaire && (
              <span
                className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${etatColor[fiche.etatSanitaire]}`}
              >
                État sanitaire : {fiche.etatSanitaire}
              </span>
            )}
          </div>
          <AssocierDepense
            zoneId={fiche.zoneId}
            ficheId={fiche.id}
            defaultCat={categorieDe(fiche.type)}
            onAdd={(d) => {
              addDepense(d);
              toast.success("Dépense associée — en attente de validation dans Analytique");
            }}
          />
        </div>

        {dar && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-destructive">
              Récolte à ne pas anticiper avant le {fmtDate(dar.dateLimite)} — délai avant récolte en cours. La
              récolte de cette zone est actuellement prévue le {fmtDate(dar.recolte)}.
            </p>
          </div>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {champs.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {fiche.photos && fiche.photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {fiche.photos.map((p) => (
              <span key={p} className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs">
                <ImageIcon className="h-3.5 w-3.5 text-primary" /> {p}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground">{fiche.notes}</p>

        <Link
          to="/suivi/zone/$zoneId"
          params={{ zoneId: fiche.zoneId }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <MapPin className="h-4 w-4" /> Voir la zone {zone?.nom} et ses {autres.length} autres fiches
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
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        d.statut === "Validé" ? "bg-primary/10 text-primary" : "bg-warning/20 text-accent-foreground"
                      }`}
                    >
                      {d.statut}
                    </span>
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
  defaultCat,
  onAdd,
}: {
  zoneId: string;
  ficheId: string;
  defaultCat: Categorie;
  onAdd: (d: Omit<Depense, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [montant, setMontant] = useState(3500);
  const [categorie, setCategorie] = useState<Categorie>(defaultCat);
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
          <select className={ctl} value={categorie} onChange={(e) => setCategorie(e.target.value as Categorie)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
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
              statut: "En attente",
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
