import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const CATEGORIES = [
  "Intrants phytosanitaires",
  "Engrais",
  "Main d'œuvre",
  "Équipement",
  "Transport/Export",
] as const;
export type Categorie = (typeof CATEGORIES)[number];

export type Zone = {
  id: string;
  nom: string;
  culture: string;
  famille: "Maraîchage" | "Fruits rouges";
  superficie: number;
  responsable: string;
  prochaineRecolte?: string | undefined;
};

export type TypeFiche = "Traitement phytosanitaire" | "Apport d'engrais" | "Suivi de plantation";

export type Fiche = {
  id: string;
  ref: string;
  date: string;
  heure?: string | undefined;
  zoneId: string;
  type: TypeFiche;
  produit: string;
  quantite: string;
  responsable: string;
  notes: string;
  historique: { date: string; label: string }[];
  isNew?: boolean | undefined;
  // Traitement phytosanitaire
  matiereActive?: string | undefined;
  cible?: string | undefined;
  methode?: string | undefined;
  dar?: number | undefined;
  // Apport d'engrais
  typeEngrais?: string | undefined;
  stadeCulture?: string | undefined;
  // Suivi de plantation
  stade?: string | undefined;
  etatSanitaire?: "Bon" | "Moyen" | "À surveiller" | undefined;
  photos?: string[] | undefined;
};

export type Depense = {
  id: string;
  date: string;
  zoneId: string;
  categorie: Categorie;
  libelle: string;
  montant: number;
  statut: "Validé" | "En attente";
  ficheId?: string | undefined;
};

export type Budget = { zoneId: string; montants: Record<Categorie, number> };

export type Rapport = {
  id: string;
  titre: string;
  date: string;
  total: number;
  lignes: number;
  zones: number;
};

export type Activite = { id: string; label: string; time: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400000));
const daysAhead = (n: number) => iso(new Date(Date.now() + n * 86400000));

export const addDays = (date: string, n: number) => iso(new Date(new Date(date).getTime() + n * 86400000));

const ZONES: Zone[] = [
  {
    id: "z1",
    nom: "Serre A1",
    culture: "Tomate cerise",
    famille: "Maraîchage",
    superficie: 3.2,
    responsable: "Youssef Ait Baha",
    prochaineRecolte: daysAhead(3),
  },
  {
    id: "z2",
    nom: "Serre A2",
    culture: "Poivron",
    famille: "Maraîchage",
    superficie: 2.5,
    responsable: "Hassan Boukhris",
    prochaineRecolte: daysAhead(18),
  },
  {
    id: "z3",
    nom: "Serre B3",
    culture: "Fraise",
    famille: "Fruits rouges",
    superficie: 4.1,
    responsable: "Fatima Zahra El Idrissi",
    prochaineRecolte: daysAhead(9),
  },
  {
    id: "z4",
    nom: "Serre B4",
    culture: "Framboise",
    famille: "Fruits rouges",
    superficie: 2.8,
    responsable: "Karim Oulhaj",
    prochaineRecolte: daysAhead(21),
  },
  {
    id: "z5",
    nom: "Parcelle plein champ 2",
    culture: "Courgette",
    famille: "Maraîchage",
    superficie: 6.4,
    responsable: "Said Amrani",
    prochaineRecolte: daysAhead(12),
  },
];

const mk = (a: number, b: number, c: number, d: number, e: number): Record<Categorie, number> => ({
  "Intrants phytosanitaires": a,
  Engrais: b,
  "Main d'œuvre": c,
  Équipement: d,
  "Transport/Export": e,
});

const BUDGETS: Budget[] = [
  { zoneId: "z1", montants: mk(6000, 6000, 16000, 5000, 4000) },
  { zoneId: "z2", montants: mk(4500, 4500, 11000, 4000, 3000) },
  { zoneId: "z3", montants: mk(7000, 7000, 18000, 6000, 5000) },
  { zoneId: "z4", montants: mk(5000, 5000, 12000, 4000, 3500) },
  { zoneId: "z5", montants: mk(3500, 3500, 9000, 5000, 3000) },
];

const DEFAULT_BUDGET = mk(4000, 4000, 10000, 4000, 3000);

const PRODUITS_PHYTO = [
  { nom: "Fongicide cuivre Cuprofix", ma: "Oxychlorure de cuivre", cible: "Mildiou", dar: 7 },
  { nom: "Bactospéine WG", ma: "Bacillus thuringiensis", cible: "Tuta absoluta", dar: 3 },
  { nom: "Soufre mouillable Thiovit", ma: "Soufre 80%", cible: "Oïdium", dar: 5 },
  { nom: "Vertimec Pro", ma: "Abamectine", cible: "Acariens (Tetranychus)", dar: 14 },
];
const METHODES_PHYTO = ["Pulvérisation", "Goutte-à-goutte", "Brumisation"];
const ENGRAIS = [
  { nom: "Engrais NPK 12-12-17", type: "NPK" },
  { nom: "Nitrate de calcium", type: "Oligo-éléments" },
  { nom: "Sulfate de potassium", type: "NPK" },
  { nom: "Compost organique", type: "Organique" },
];
const METHODES_ENGRAIS = ["Fertigation", "Épandage manuel", "Pulvérisation foliaire"];
const STADES = ["Levée", "Croissance végétative", "Floraison", "Fructification", "Récolte"];
const ETATS: Fiche["etatSanitaire"][] = ["Bon", "Moyen", "À surveiller"];

export const PRODUITS_PHYTO_REF = PRODUITS_PHYTO;
export const METHODES_PHYTO_REF = METHODES_PHYTO;
export const METHODES_ENGRAIS_REF = METHODES_ENGRAIS;
export const TYPES_ENGRAIS_REF = ["NPK", "Organique", "Foliaire", "Oligo-éléments"];
export const STADES_REF = STADES;
export const TYPES_FICHE: TypeFiche[] = ["Traitement phytosanitaire", "Apport d'engrais", "Suivi de plantation"];

const RESPONSABLES = [
  "Youssef Ait Baha",
  "Hassan Boukhris",
  "Fatima Zahra El Idrissi",
  "Karim Oulhaj",
  "Said Amrani",
];

function buildFiches(): Fiche[] {
  const out: Fiche[] = [];
  for (let i = 0; i < 25; i++) {
    const type = TYPES_FICHE[i % 3]!;
    const zone = ZONES[i % ZONES.length]!;
    const date = daysAgo(i * 2 + 1);
    const responsable = RESPONSABLES[i % RESPONSABLES.length]!;
    const base = {
      id: `f${i + 1}`,
      ref: `FS-2026-${String(i + 1).padStart(3, "0")}`,
      date,
      heure: `0${7 + (i % 3)}:${i % 2 ? "30" : "00"}`,
      zoneId: zone.id,
      responsable,
      historique: [
        { date, label: "Fiche créée" },
        { date: daysAgo(i * 2), label: "Validation par le chef de culture" },
      ],
    };
    if (type === "Traitement phytosanitaire") {
      const p = PRODUITS_PHYTO[i % 4]!;
      out.push({
        ...base,
        type,
        produit: p.nom,
        matiereActive: p.ma,
        cible: p.cible,
        dar: p.dar,
        methode: METHODES_PHYTO[i % 3]!,
        quantite: `${(1 + (i % 4) * 0.5).toFixed(1)} L/ha`,
        notes: "Application en début de matinée, conditions météo favorables, pas de vent.",
      });
    } else if (type === "Apport d'engrais") {
      const e = ENGRAIS[i % 4]!;
      out.push({
        ...base,
        type,
        produit: e.nom,
        typeEngrais: e.type,
        methode: METHODES_ENGRAIS[i % 3]!,
        stadeCulture: STADES[i % STADES.length]!,
        quantite: `${20 + i * 2} kg`,
        notes: "Apport réalisé selon le plan de fertilisation hebdomadaire.",
      });
    } else {
      out.push({
        ...base,
        type,
        produit: `Suivi ${zone.culture.toLowerCase()}`,
        stade: STADES[i % STADES.length]!,
        etatSanitaire: ETATS[i % 3]!,
        photos: i % 2 === 0 ? ["photo-parcelle-1.jpg"] : [],
        quantite: "—",
        notes: "Observation de routine, aucun signe de stress hydrique relevé.",
      });
    }
  }
  return out;
}

function buildDepenses(fiches: Fiche[]): Depense[] {
  const out: Depense[] = [];
  for (let i = 0; i < 28; i++) {
    const zone = ZONES[i % ZONES.length]!;
    const categorie = CATEGORIES[i % CATEGORIES.length]!;
    const montant = 1800 + ((i * 1737) % 9000);
    out.push({
      id: `d${i + 1}`,
      date: daysAgo((i % 28) + 1),
      zoneId: zone.id,
      categorie,
      libelle:
        categorie === "Intrants phytosanitaires"
          ? `Achat ${PRODUITS_PHYTO[i % 4]!.nom.toLowerCase()}`
          : categorie === "Engrais"
            ? `Achat ${ENGRAIS[i % 4]!.nom.toLowerCase()}`
            : categorie === "Main d'œuvre"
              ? "Équipe saisonnière — semaine"
              : categorie === "Équipement"
                ? "Maintenance goutte-à-goutte"
                : "Transport palettes vers Agadir",
      montant,
      statut: i % 6 === 0 ? "En attente" : "Validé",
      ficheId: i < 8 ? fiches[i]!.id : undefined,
    });
  }
  return out;
}

const initialFiches = buildFiches();
const initialDepenses = buildDepenses(initialFiches);

const ACTIVITES: Activite[] = [
  { id: "a1", label: "Traitement phytosanitaire enregistré — Serre A1", time: "il y a 20 min" },
  {
    id: "a2",
    label: "Alerte budgétaire déclenchée — Parcelle plein champ 2 à 92% du budget mensuel",
    time: "il y a 1 h",
  },
  { id: "a3", label: "Synchronisation Zoho Books effectuée", time: "il y a 2 h" },
  { id: "a4", label: "Apport d'engrais NPK enregistré — Serre B3 — 40 kg", time: "il y a 5 h" },
  { id: "a5", label: "Dépense affectée — Équipement — Serre B4 — 7 400 MAD", time: "hier" },
  { id: "a6", label: "Suivi de plantation fraisier — Serre B3 — stade floraison", time: "hier" },
];

export type DarAlerte = { ficheId: string; zoneId: string; dateLimite: string; recolte: string };

type Ctx = {
  zones: Zone[];
  fiches: Fiche[];
  depenses: Depense[];
  budgets: Budget[];
  rapports: Rapport[];
  activites: Activite[];
  configValidee: boolean;
  seuilOrange: number;
  seuilRouge: number;
  destinataires: string[];
  lastSync: Date;
  addZone: (z: Omit<Zone, "id">) => void;
  updateZone: (id: string, patch: Partial<Zone>) => void;
  removeZone: (id: string) => void;
  addFiche: (f: Omit<Fiche, "id" | "ref" | "historique">) => Fiche;
  addDepense: (d: Omit<Depense, "id" | "statut"> & { statut?: Depense["statut"] }) => void;
  validerDepense: (id: string) => void;
  setBudget: (zoneId: string, cat: Categorie, montant: number) => void;
  setSeuils: (orange: number, rouge: number) => void;
  setDestinataires: (list: string[]) => void;
  validerConfig: () => void;
  addRapport: (r: Omit<Rapport, "id">) => void;
  syncZoho: () => void;
  pushActivite: (label: string) => void;
  zoneBudget: (zoneId: string) => number;
  zoneConsomme: (zoneId: string) => number;
  zoneEnAttente: (zoneId: string) => number;
  catBudget: (zoneId: string, cat: Categorie) => number;
  catConsomme: (zoneId: string, cat: Categorie) => number;
  zoneNiveau: (zoneId: string) => "ok" | "orange" | "rouge";
  alertes: { zoneId: string; nom: string; pct: number; niveau: "orange" | "rouge" }[];
  darAlertes: DarAlerte[];
  ficheDar: (f: Fiche) => DarAlerte | null;
};

const FarmContext = createContext<Ctx | null>(null);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Zone[]>(ZONES);
  const [fiches, setFiches] = useState<Fiche[]>(initialFiches);
  const [depenses, setDepenses] = useState<Depense[]>(initialDepenses);
  const [budgets, setBudgets] = useState<Budget[]>(BUDGETS);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [activites, setActivites] = useState<Activite[]>(ACTIVITES);
  const [configValidee, setConfigValidee] = useState(false);
  const [seuilOrange, setSO] = useState(80);
  const [seuilRouge, setSR] = useState(100);
  const [destinataires, setDest] = useState<string[]>(["amin@amgrow.ma", "technique@amgrow.ma"]);
  const [lastSync, setLastSync] = useState<Date>(new Date(Date.now() - 2 * 3600000));

  const pushActivite = useCallback((label: string) => {
    setActivites((a) => [{ id: `a${Date.now()}`, label, time: "à l'instant" }, ...a]);
  }, []);

  const value = useMemo<Ctx>(() => {
    const zoneBudget = (zoneId: string) => {
      const b = budgets.find((x) => x.zoneId === zoneId);
      return b ? CATEGORIES.reduce((s, c) => s + (b.montants[c] ?? 0), 0) : 0;
    };
    const catBudget = (zoneId: string, cat: Categorie) =>
      budgets.find((x) => x.zoneId === zoneId)?.montants[cat] ?? 0;
    const zoneConsomme = (zoneId: string) =>
      depenses.filter((d) => d.zoneId === zoneId && d.statut === "Validé").reduce((s, d) => s + d.montant, 0);
    const zoneEnAttente = (zoneId: string) =>
      depenses.filter((d) => d.zoneId === zoneId && d.statut === "En attente").reduce((s, d) => s + d.montant, 0);
    const catConsomme = (zoneId: string, cat: Categorie) =>
      depenses
        .filter((d) => d.zoneId === zoneId && d.categorie === cat && d.statut === "Validé")
        .reduce((s, d) => s + d.montant, 0);
    const zoneNiveau = (zoneId: string): "ok" | "orange" | "rouge" => {
      const b = zoneBudget(zoneId);
      if (!b) return "ok";
      const pct = (zoneConsomme(zoneId) / b) * 100;
      if (pct >= seuilRouge) return "rouge";
      if (pct >= seuilOrange) return "orange";
      return "ok";
    };
    const alertes = zones
      .map((z) => {
        const b = zoneBudget(z.id);
        const pct = b ? Math.round((zoneConsomme(z.id) / b) * 100) : 0;
        return { zoneId: z.id, nom: z.nom, pct, niveau: zoneNiveau(z.id) };
      })
      .filter((a) => a.niveau !== "ok") as Ctx["alertes"];

    const ficheDar = (f: Fiche): DarAlerte | null => {
      if (f.type !== "Traitement phytosanitaire" || !f.dar) return null;
      const zone = zones.find((z) => z.id === f.zoneId);
      if (!zone?.prochaineRecolte) return null;
      const limite = addDays(f.date, f.dar);
      if (new Date(zone.prochaineRecolte) >= new Date(limite)) return null;
      if (new Date(limite) < new Date()) return null;
      return { ficheId: f.id, zoneId: f.zoneId, dateLimite: limite, recolte: zone.prochaineRecolte };
    };
    const darAlertes = fiches.map(ficheDar).filter(Boolean) as DarAlerte[];

    return {
      zones,
      fiches,
      depenses,
      budgets,
      rapports,
      activites,
      configValidee,
      seuilOrange,
      seuilRouge,
      destinataires,
      lastSync,
      zoneBudget,
      zoneConsomme,
      zoneEnAttente,
      catBudget,
      catConsomme,
      zoneNiveau,
      alertes,
      darAlertes,
      ficheDar,
      addZone: (z) => {
        const id = `z${Date.now()}`;
        setZones((prev) => [...prev, { ...z, id }]);
        setBudgets((prev) => [...prev, { zoneId: id, montants: { ...DEFAULT_BUDGET } }]);
        pushActivite(`Nouvelle zone créée — ${z.nom}`);
      },
      updateZone: (id, patch) => setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z))),
      removeZone: (id) => {
        setZones((prev) => prev.filter((z) => z.id !== id));
        setBudgets((prev) => prev.filter((b) => b.zoneId !== id));
      },
      addFiche: (f) => {
        const ref = `FS-2026-${String(fiches.length + 1).padStart(3, "0")}`;
        const fiche: Fiche = {
          ...f,
          id: `f${Date.now()}`,
          ref,
          isNew: true,
          historique: [{ date: f.date, label: "Fiche créée" }],
        };
        setFiches((prev) => [fiche, ...prev]);
        pushActivite(
          `${f.type} enregistré — ${zones.find((z) => z.id === f.zoneId)?.nom ?? "Zone"} — ${f.produit}`,
        );
        return fiche;
      },
      addDepense: (d) => {
        const dep: Depense = { statut: "En attente", ...d, id: `d${Date.now()}` };
        setDepenses((prev) => [dep, ...prev]);
        if (d.ficheId) {
          setFiches((prev) =>
            prev.map((f) =>
              f.id === d.ficheId
                ? {
                    ...f,
                    historique: [
                      ...f.historique,
                      { date: d.date, label: `Dépense associée — ${d.montant.toLocaleString("fr-FR")} MAD` },
                    ],
                  }
                : f,
            ),
          );
        }
        pushActivite(
          `Dépense affectée — ${d.categorie} — ${zones.find((z) => z.id === d.zoneId)?.nom ?? ""} — ${d.montant.toLocaleString("fr-FR")} MAD`,
        );
      },
      validerDepense: (id) => {
        setDepenses((prev) => prev.map((d) => (d.id === id ? { ...d, statut: "Validé" } : d)));
        const d = depenses.find((x) => x.id === id);
        if (d) pushActivite(`Allocation validée — ${d.libelle} — ${d.montant.toLocaleString("fr-FR")} MAD`);
      },
      setBudget: (zoneId, cat, montant) =>
        setBudgets((prev) =>
          prev.map((b) => (b.zoneId === zoneId ? { ...b, montants: { ...b.montants, [cat]: montant } } : b)),
        ),
      setSeuils: (o, r) => {
        setSO(o);
        setSR(r);
      },
      setDestinataires: setDest,
      validerConfig: () => setConfigValidee(true),
      addRapport: (r) => setRapports((prev) => [{ ...r, id: `r${Date.now()}` }, ...prev]),
      syncZoho: () => {
        setLastSync(new Date());
        pushActivite("Synchronisation Zoho Books effectuée");
      },
      pushActivite,
    };
  }, [
    zones,
    fiches,
    depenses,
    budgets,
    rapports,
    activites,
    configValidee,
    seuilOrange,
    seuilRouge,
    destinataires,
    lastSync,
    pushActivite,
  ]);

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm doit être utilisé dans FarmProvider");
  return ctx;
}

export const fmtMAD = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} MAD`;
export const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");
export const fmtTime = (d: Date) =>
  d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
