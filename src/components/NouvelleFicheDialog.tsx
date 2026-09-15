import { Bug, Leaf, Plus, Sprout, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  METHODES_ENGRAIS_REF,
  METHODES_PHYTO_REF,
  STADES_REF,
  TYPES_ENGRAIS_REF,
  useFarm,
  type Fiche,
  type TypeFiche,
} from "@/lib/farm-store";

const ctl =
  "h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary/60";

const CHOIX: { type: TypeFiche; icon: typeof Bug; desc: string }[] = [
  { type: "Traitement phytosanitaire", icon: Bug, desc: "Produit, cible, dose, méthode et délai avant récolte" },
  { type: "Apport d'engrais", icon: Leaf, desc: "Type d'engrais, dose, méthode et stade de la culture" },
  { type: "Suivi de plantation", icon: Sprout, desc: "Stade phénologique, état sanitaire et photos" },
];

export function NouvelleFicheDialog({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSubmit: ReturnType<typeof useFarm>["addFiche"];
}) {
  const { zones } = useFarm();
  const [type, setType] = useState<TypeFiche | null>(null);

  const close = () => {
    setOpen(false);
    setTimeout(() => setType(null), 200);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(() => setType(null), 200);
      }}
    >
      <DialogTrigger asChild>
        <button className="shine flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Ajouter une fiche
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto scroll-green">
        <DialogHeader>
          <DialogTitle className="font-display">
            {type ? `Nouvelle fiche — ${type}` : "Quel type de fiche souhaitez-vous créer ?"}
          </DialogTitle>
        </DialogHeader>

        {!type && (
          <div className="space-y-2">
            {CHOIX.map((c) => (
              <button
                key={c.type}
                onClick={() => setType(c.type)}
                className="flex w-full items-start gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted"
              >
                <c.icon className="mt-0.5 h-5 w-5 text-primary" />
                <span>
                  <span className="block font-semibold">{c.type}</span>
                  <span className="block text-sm text-muted-foreground">{c.desc}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {type && (
          <FormFiche
            type={type}
            zones={zones}
            onBack={() => setType(null)}
            onSubmit={(f) => {
              onSubmit(f);
              close();
              toast.success("Fiche de suivi ajoutée");
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormFiche({
  type,
  zones,
  onBack,
  onSubmit,
}: {
  type: TypeFiche;
  zones: ReturnType<typeof useFarm>["zones"];
  onBack: () => void;
  onSubmit: (f: Omit<Fiche, "id" | "ref" | "historique">) => void;
}) {
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [heure, setHeure] = useState("08:00");
  const [produit, setProduit] = useState("");
  const [matiereActive, setMatiereActive] = useState("");
  const [cible, setCible] = useState("");
  const [quantite, setQuantite] = useState("");
  const [methode, setMethode] = useState(
    type === "Traitement phytosanitaire" ? METHODES_PHYTO_REF[0]! : METHODES_ENGRAIS_REF[0]!,
  );
  const [dar, setDar] = useState(7);
  const [typeEngrais, setTypeEngrais] = useState(TYPES_ENGRAIS_REF[0]!);
  const [stadeCulture, setStadeCulture] = useState(STADES_REF[1]!);
  const [stade, setStade] = useState(STADES_REF[1]!);
  const [etatSanitaire, setEtat] = useState<NonNullable<Fiche["etatSanitaire"]>>("Bon");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const [responsable, setResponsable] = useState("");
  const [notes, setNotes] = useState("");

  const simulateUpload = () => {
    if (uploading) return;
    setUploading(1);
    const t = setInterval(() => {
      setUploading((p) => {
        if (p >= 100) {
          clearInterval(t);
          setPhotos((ph) => [...ph, `photo-${ph.length + 1}.jpg`]);
          toast.success("Photo ajoutée à la fiche");
          return 0;
        }
        return p + 10;
      });
    }, 100);
  };

  const submit = () => {
    if (type === "Suivi de plantation") {
      onSubmit({
        zoneId,
        date,
        heure,
        type,
        produit: produit.trim() || `Suivi ${zones.find((z) => z.id === zoneId)?.culture ?? ""}`.trim(),
        quantite: "—",
        stade,
        etatSanitaire,
        photos,
        responsable: responsable || "M. Amin",
        notes,
      });
      return;
    }
    if (!produit.trim()) {
      toast.error("Indiquez le produit utilisé");
      return;
    }
    if (type === "Traitement phytosanitaire") {
      onSubmit({
        zoneId,
        date,
        heure,
        type,
        produit,
        matiereActive,
        cible,
        methode,
        dar,
        quantite: quantite || "—",
        responsable: responsable || "M. Amin",
        notes,
      });
    } else {
      onSubmit({
        zoneId,
        date,
        heure,
        type,
        produit,
        typeEngrais,
        methode,
        stadeCulture,
        quantite: quantite || "—",
        responsable: responsable || "M. Amin",
        notes,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Zone">
          <select className={ctl} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nom} — {z.culture}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" className={ctl} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        {type === "Traitement phytosanitaire" && (
          <>
            <Field label="Heure">
              <input type="time" className={ctl} value={heure} onChange={(e) => setHeure(e.target.value)} />
            </Field>
            <Field label="Produit (nom commercial)">
              <input className={ctl} value={produit} onChange={(e) => setProduit(e.target.value)} />
            </Field>
            <Field label="Matière active">
              <input className={ctl} value={matiereActive} onChange={(e) => setMatiereActive(e.target.value)} />
            </Field>
            <Field label="Cible (ravageur / maladie)">
              <input
                className={ctl}
                placeholder="Tuta absoluta, oïdium…"
                value={cible}
                onChange={(e) => setCible(e.target.value)}
              />
            </Field>
            <Field label="Dose (L ou kg)">
              <input className={ctl} value={quantite} onChange={(e) => setQuantite(e.target.value)} />
            </Field>
            <Field label="Méthode d'application">
              <select className={ctl} value={methode} onChange={(e) => setMethode(e.target.value)}>
                {METHODES_PHYTO_REF.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="DAR — délai avant récolte (jours)">
              <input type="number" className={ctl} value={dar} onChange={(e) => setDar(Number(e.target.value))} />
            </Field>
          </>
        )}

        {type === "Apport d'engrais" && (
          <>
            <Field label="Engrais utilisé">
              <input className={ctl} value={produit} onChange={(e) => setProduit(e.target.value)} />
            </Field>
            <Field label="Type d'engrais">
              <select className={ctl} value={typeEngrais} onChange={(e) => setTypeEngrais(e.target.value)}>
                {TYPES_ENGRAIS_REF.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Dose (kg ou L)">
              <input className={ctl} value={quantite} onChange={(e) => setQuantite(e.target.value)} />
            </Field>
            <Field label="Méthode">
              <select className={ctl} value={methode} onChange={(e) => setMethode(e.target.value)}>
                {METHODES_ENGRAIS_REF.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Stade de la culture">
              <select className={ctl} value={stadeCulture} onChange={(e) => setStadeCulture(e.target.value)}>
                {STADES_REF.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        {type === "Suivi de plantation" && (
          <>
            <Field label="Intitulé du suivi">
              <input className={ctl} value={produit} onChange={(e) => setProduit(e.target.value)} />
            </Field>
            <Field label="Stade phénologique">
              <select className={ctl} value={stade} onChange={(e) => setStade(e.target.value)}>
                {STADES_REF.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="État sanitaire">
              <select
                className={ctl}
                value={etatSanitaire}
                onChange={(e) => setEtat(e.target.value as NonNullable<Fiche["etatSanitaire"]>)}
              >
                <option>Bon</option>
                <option>Moyen</option>
                <option>À surveiller</option>
              </select>
            </Field>
          </>
        )}

        <Field label="Responsable">
          <input className={ctl} value={responsable} onChange={(e) => setResponsable(e.target.value)} />
        </Field>
        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Observations / notes</span>
          <textarea
            className="min-h-20 w-full rounded-lg border border-border bg-background/80 p-3 text-sm outline-none focus:border-primary/60"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      {type === "Suivi de plantation" && (
        <div className="rounded-xl border border-dashed border-primary/40 p-4">
          <button
            onClick={simulateUpload}
            className="flex w-full flex-col items-center gap-2 text-sm text-muted-foreground"
          >
            <Upload className="h-5 w-5 text-primary" />
            Glissez une photo ici ou cliquez pour ajouter
          </button>
          {uploading > 0 && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-100" style={{ width: `${uploading}%` }} />
            </div>
          )}
          {photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {photos.map((p) => (
                <span key={p} className="rounded-lg bg-muted px-2.5 py-1 text-xs">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onBack} className="h-10 rounded-xl border border-border px-4 text-sm font-medium">
          Retour
        </button>
        <button
          onClick={submit}
          className="shine h-10 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          Valider la fiche
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
