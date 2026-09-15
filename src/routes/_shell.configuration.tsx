import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { fmtTime, useFarm, type Zone } from "@/lib/farm-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_shell/configuration")({
  head: () => ({
    meta: [
      { title: "Configuration — AM Grow Control" },
      {
        name: "description",
        content:
          "Connexion Zoho Books, référentiel des zones et cultures, seuils budgétaires et destinataires d'alertes.",
      },
      { property: "og:title", content: "Configuration — AM Grow Control" },
      { property: "og:description", content: "Zones, cultures, seuils budgétaires et connexion Zoho Books." },
    ],
  }),
  component: ConfigurationPage,
});

function ConfigurationPage() {
  const farm = useFarm();
  const [testing, setTesting] = useState(false);
  const [step, setStep] = useState("");

  const testConnexion = () => {
    setTesting(true);
    setStep("Connexion à Zoho Books…");
    setTimeout(() => setStep("Vérification des accès…"), 750);
    setTimeout(() => {
      farm.syncZoho();
      setTesting(false);
      setStep("");
      toast.success("Connexion Zoho Books vérifiée — synchronisation mise à jour");
    }, 1500);
  };

  const save = (label: string) => {
    farm.validerConfig();
    toast.success(`${label} enregistré(e)`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Référentiel de la ferme, connexion comptable et règles d'alerte budgétaire.
          </p>
        </div>
        {farm.configValidee && (
          <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" /> Configuration active ✅
          </span>
        )}
      </div>

      <Tabs defaultValue="connexions">
        <TabsList className="glass rounded-xl">
          <TabsTrigger value="connexions">Connexions</TabsTrigger>
          <TabsTrigger value="zones">Zones & Cultures</TabsTrigger>
          <TabsTrigger value="seuils">Seuils budgétaires & alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="connexions" className="mt-4">
          <div className="glass glass-lift rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Zoho Books</h2>
                <p className="text-sm text-muted-foreground">
                  Dernière synchronisation : {fmtTime(farm.lastSync)}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                Connecté ✅
              </span>
            </div>

            <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
              Zoho Books reste l'outil de référence pour la comptabilité (achats, ventes, banque, fournisseurs,
              paiements). Cette plateforme s'y connecte pour enrichir l'analyse par zone et par culture, sans
              dupliquer ni remplacer cette partie.
            </p>

            {testing && (
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" /> {step}
                </p>
                <div className="shimmer h-10 w-full" />
                <div className="shimmer h-10 w-2/3" />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={testConnexion}
                disabled={testing}
                className="shine h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                Tester la connexion
              </button>
              <button
                onClick={() => save("Connexion")}
                className="shine flex h-10 items-center gap-2 rounded-xl border border-primary/30 bg-card px-5 text-sm font-semibold text-primary"
              >
                <Save className="h-4 w-4" /> Enregistrer la configuration
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="zones" className="mt-4">
          <ZonesTab onSave={() => save("Référentiel des zones")} />
        </TabsContent>

        <TabsContent value="seuils" className="mt-4">
          <SeuilsTab onSave={() => save("Seuils budgétaires")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const EMPTY = {
  nom: "",
  culture: "",
  famille: "Maraîchage" as Zone["famille"],
  superficie: 1,
  responsable: "",
};

function ZonesTab({ onSave }: { onSave: () => void }) {
  const { zones, addZone, updateZone, removeZone } = useFarm();
  const [draft, setDraft] = useState(EMPTY);

  const add = () => {
    if (!draft.nom.trim() || !draft.culture.trim()) {
      toast.error("Nom de zone et culture sont requis");
      return;
    }
    addZone(draft);
    setDraft(EMPTY);
    toast.success(`Zone « ${draft.nom} » ajoutée au référentiel`);
  };

  const input = "h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary/60";

  return (
    <div className="glass glass-lift rounded-2xl p-6">
      <h2 className="font-display text-lg font-semibold">Zones & cultures</h2>
      <p className="text-sm text-muted-foreground">
        Ce référentiel alimente le suivi agronomique et l'analytique budgétaire.
      </p>

      <div className="mt-4 overflow-x-auto scroll-green">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Zone</th>
              <th className="py-2 pr-3 font-medium">Culture</th>
              <th className="py-2 pr-3 font-medium">Famille</th>
              <th className="py-2 pr-3 font-medium">Superficie (ha)</th>
              <th className="py-2 pr-3 font-medium">Responsable</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-b last:border-0">
                <td className="py-2 pr-3">
                  <input className={input} value={z.nom} onChange={(e) => updateZone(z.id, { nom: e.target.value })} />
                </td>
                <td className="py-2 pr-3">
                  <input
                    className={input}
                    value={z.culture}
                    onChange={(e) => updateZone(z.id, { culture: e.target.value })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <select
                    className={input}
                    value={z.famille}
                    onChange={(e) => updateZone(z.id, { famille: e.target.value as Zone["famille"] })}
                  >
                    <option>Maraîchage</option>
                    <option>Fruits rouges</option>
                  </select>
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    step="0.1"
                    className={input}
                    value={z.superficie}
                    onChange={(e) => updateZone(z.id, { superficie: Number(e.target.value) })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    className={input}
                    value={z.responsable}
                    onChange={(e) => updateZone(z.id, { responsable: e.target.value })}
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => {
                      removeZone(z.id);
                      toast.success(`Zone « ${z.nom} » supprimée`);
                    }}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-dashed border-primary/30 p-4 md:grid-cols-6">
        <input
          className={input}
          placeholder="Serre C1"
          value={draft.nom}
          onChange={(e) => setDraft({ ...draft, nom: e.target.value })}
        />
        <input
          className={input}
          placeholder="Myrtille"
          value={draft.culture}
          onChange={(e) => setDraft({ ...draft, culture: e.target.value })}
        />
        <select
          className={input}
          value={draft.famille}
          onChange={(e) => setDraft({ ...draft, famille: e.target.value as Zone["famille"] })}
        >
          <option>Maraîchage</option>
          <option>Fruits rouges</option>
        </select>
        <input
          type="number"
          step="0.1"
          className={input}
          value={draft.superficie}
          onChange={(e) => setDraft({ ...draft, superficie: Number(e.target.value) })}
        />
        <input
          className={input}
          placeholder="Responsable"
          value={draft.responsable}
          onChange={(e) => setDraft({ ...draft, responsable: e.target.value })}
        />
        <button
          onClick={add}
          className="shine flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <button
        onClick={onSave}
        className="shine mt-6 flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        <Save className="h-4 w-4" /> Enregistrer la configuration
      </button>
    </div>
  );
}

function SeuilsTab({ onSave }: { onSave: () => void }) {
  const { zones, budgets, setBudget, seuilOrange, seuilRouge, setSeuils, destinataires, setDestinataires } =
    useFarm();
  const [emails, setEmails] = useState(destinataires.join(", "));
  const input = "h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm outline-none focus:border-primary/60";

  return (
    <div className="glass glass-lift rounded-2xl p-6">
      <h2 className="font-display text-lg font-semibold">Budgets mensuels par zone (MAD)</h2>
      <div className="mt-4 overflow-x-auto scroll-green">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Zone</th>
              <th className="py-2 pr-3 font-medium">Intrants</th>
              <th className="py-2 pr-3 font-medium">Main d'œuvre</th>
              <th className="py-2 pr-3 font-medium">Équipement</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => {
              const b = budgets.find((x) => x.zoneId === z.id);
              return (
                <tr key={z.id} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-medium">{z.nom}</td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      className={input}
                      value={b?.intrants ?? 0}
                      onChange={(e) => setBudget(z.id, { intrants: Number(e.target.value) })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      className={input}
                      value={b?.mainOeuvre ?? 0}
                      onChange={(e) => setBudget(z.id, { mainOeuvre: Number(e.target.value) })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      className={input}
                      value={b?.equipement ?? 0}
                      onChange={(e) => setBudget(z.id, { equipement: Number(e.target.value) })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Seuil orange (%)</span>
          <input
            type="number"
            className={input}
            value={seuilOrange}
            onChange={(e) => setSeuils(Number(e.target.value), seuilRouge)}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Seuil rouge (%)</span>
          <input
            type="number"
            className={input}
            value={seuilRouge}
            onChange={(e) => setSeuils(seuilOrange, Number(e.target.value))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Destinataires des alertes</span>
          <input
            className={input}
            value={emails}
            onChange={(e) => {
              setEmails(e.target.value);
              setDestinataires(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              );
            }}
          />
        </label>
      </div>

      <button
        onClick={onSave}
        className="shine mt-6 flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        <Save className="h-4 w-4" /> Enregistrer la configuration
      </button>
    </div>
  );
}
