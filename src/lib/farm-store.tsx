import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Zone = {
  id: string;
  nom: string;
  culture: string;
  famille: "Maraîchage" | "Fruits rouges";
  superficie: number;
  responsable: string;
};

export type Fiche = {
  id: string;
  ref: string;
  date: string;
  zoneId: string;
  type: "Traitement phytosanitaire" | "Engrais" | "Suivi de plantation";
  produit: string;
  quantite: string;
  responsable: string;
  notes: string;
  historique: { date: string; label: string }[];
  isNew?: boolean | undefined;
};

export type Depense = {
  id: string;
  date: string;
  zoneId: string;
  categorie: "Intrants" | "Main d'œuvre" | "Équipement";
  libelle: string;
  montant: number;
  ficheId?: string | undefined;
};

export type Budget = {
  zoneId: string;
  intrants: number;
  mainOeuvre: number;
  equipement: number;
};

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

const ZONES: Zone[] = [
  {
    id: "z1",
    nom: "Serre A1",
    culture: "Tomate cerise",
    famille: "Maraîchage",
    superficie: 3.2,
    responsable: "Youssef Ait Baha",
  },
  {
    id: "z2",
    nom: "Serre A2",
    culture: "Poivron",
    famille: "Maraîchage",
    superficie: 2.5,
    responsable: "Hassan Boukhris",
  },
  {
    id: "z3",
    nom: "Serre B3",
    culture: "Fraise",
    famille: "Fruits rouges",
    superficie: 4.1,
    responsable: "Fatima Zahra El Idrissi",
  },
  {
    id: "z4",
    nom: "Serre B4",
    culture: "Framboise",
    famille: "Fruits rouges",
    superficie: 2.8,
    responsable: "Karim Oulhaj",
  },
  {
    id: "z5",
    nom: "Parcelle plein champ 2",
    culture: "Courgette",
    famille: "Maraîchage",
    superficie: 6.4,
    responsable: "Said Amrani",
  },
];

const BUDGETS: Budget[] = [
  { zoneId: "z1", intrants: 42000, mainOeuvre: 55000, equipement: 18000 },
  { zoneId: "z2", intrants: 30000, mainOeuvre: 38000, equipement: 12000 },
  { zoneId: "z3", intrants: 52000, mainOeuvre: 68000, equipement: 22000 },
  { zoneId: "z4", intrants: 36000, mainOeuvre: 44000, equipement: 15000 },
  { zoneId: "z5", intrants: 28000, mainOeuvre: 35000, equipement: 20000 },
];

const produits: Record<Fiche["type"], string[]> = {
  "Traitement phytosanitaire": [
    "Fongicide cuivre",
    "Insecticide bio (Bacillus)",
    "Traitement soufre mouillable",
    "Acaricide",
  ],
  Engrais: ["Engrais NPK 12-12-17", "Nitrate de calcium", "Sulfate de potassium", "Compost organique"],
  "Suivi de plantation": [
    "Contrôle stade floraison",
    "Comptage plants",
    "Contrôle irrigation goutte-à-goutte",
    "Relevé de vigueur végétative",
  ],
};

function buildFiches(): Fiche[] {
  const types: Fiche["type"][] = ["Traitement phytosanitaire", "Engrais", "Suivi de plantation"];
  const resp = [
    "Youssef Ait Baha",
    "Hassan Boukhris",
    "Fatima Zahra El Idrissi",
    "Karim Oulhaj",
    "Said Amrani",
  ];
  const out: Fiche[] = [];
  for (let i = 0; i < 20; i++) {
    const type = types[i % 3]!;
    const zone = ZONES[i % ZONES.length]!;
    const produit = produits[type][i % 4]!;
    const quantite =
      type === "Engrais" ? `${20 + i * 2} kg` : type === "Traitement phytosanitaire" ? `${8 + i} L` : "—";
    out.push({
      id: `f${i + 1}`,
      ref: `FS-2026-${String(i + 1).padStart(3, "0")}`,
      date: daysAgo(i * 3 + 1),
      zoneId: zone.id,
      type,
      produit,
      quantite,
      responsable: resp[i % resp.length]!,
      notes:
        type === "Suivi de plantation"
          ? "Observation de routine, aucun signe de stress hydrique relevé."
          : "Application réalisée en début de matinée, conditions météo favorables.",
      historique: [
        { date: daysAgo(i * 3 + 1), label: "Fiche créée" },
        { date: daysAgo(i * 3), label: "Validation par le chef de culture" },
      ],
    });
  }
  return out;
}

function buildDepenses(fiches: Fiche[]): Depense[] {
  const cats: Depense["categorie"][] = ["Intrants", "Main d'œuvre", "Équipement"];
  const out: Depense[] = [];
  for (let i = 0; i < 26; i++) {
    const zone = ZONES[i % ZONES.length]!;
    const categorie = cats[i % 3]!;
    const montant = 2500 + ((i * 1737) % 12000);
    out.push({
      id: `d${i + 1}`,
      date: daysAgo((i % 28) + 1),
      zoneId: zone.id,
      categorie,
      libelle:
        categorie === "Intrants"
          ? `Achat ${produits.Engrais[i % 4]!.toLowerCase()}`
          : categorie === "Main d'œuvre"
            ? "Équipe saisonnière — semaine"
            : "Maintenance goutte-à-goutte",
      montant,
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
  addDepense: (d: Omit<Depense, "id">) => void;
  setBudget: (zoneId: string, patch: Partial<Omit<Budget, "zoneId">>) => void;
  setSeuils: (orange: number, rouge: number) => void;
  setDestinataires: (list: string[]) => void;
  validerConfig: () => void;
  addRapport: (r: Omit<Rapport, "id">) => void;
  syncZoho: () => void;
  pushActivite: (label: string) => void;
  zoneBudget: (zoneId: string) => number;
  zoneConsomme: (zoneId: string) => number;
  zoneNiveau: (zoneId: string) => "ok" | "orange" | "rouge";
  alertes: { zoneId: string; nom: string; pct: number; niveau: "orange" | "rouge" }[];
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
      return b ? b.intrants + b.mainOeuvre + b.equipement : 0;
    };
    const zoneConsomme = (zoneId: string) =>
      depenses.filter((d) => d.zoneId === zoneId).reduce((s, d) => s + d.montant, 0);
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
      zoneNiveau,
      alertes,
      addZone: (z) => {
        const id = `z${Date.now()}`;
        setZones((prev) => [...prev, { ...z, id }]);
        setBudgets((prev) => [...prev, { zoneId: id, intrants: 20000, mainOeuvre: 25000, equipement: 10000 }]);
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
        setDepenses((prev) => [{ ...d, id: `d${Date.now()}` }, ...prev]);
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
      setBudget: (zoneId, patch) =>
        setBudgets((prev) => prev.map((b) => (b.zoneId === zoneId ? { ...b, ...patch } : b))),
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
