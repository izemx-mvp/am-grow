import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Aurora } from "@/components/Aurora";
import { Logo } from "@/components/Logo";
import greenhouse from "@/assets/greenhouse.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AM Grow Control — Backoffice agronomique & budgétaire" },
      {
        name: "description",
        content:
          "Connexion au backoffice AM Grow : suivi agronomique des serres de Sidi Ouassay, contrôle budgétaire par zone et analytique assistée par IA.",
      },
      { property: "og:title", content: "AM Grow Control — Backoffice agronomique & budgétaire" },
      {
        property: "og:description",
        content: "Toute votre ferme, dans un seul endroit — sans rien déconnecter de ce qui marche déjà.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("contact@amgrow.ma");
  const [password, setPassword] = useState("AMGrow@2026");

  const enter = (demo?: boolean) => {
    toast.success(demo ? "Connexion démonstration réussie" : "Bienvenue, M. Amin");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <Aurora />

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Logo className="mb-6 h-20 w-auto" />
          <h1 className="font-display text-3xl font-bold tracking-tight">Connexion au backoffice</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Suivi agronomique, contrôle budgétaire et analytique IA pour les serres de Sidi Ouassay.
          </p>

          <form
            className="glass glass-lift mt-8 space-y-4 rounded-2xl p-6"
            onSubmit={(e) => {
              e.preventDefault();
              enter();
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background/80 pr-3 pl-9 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                />
              </span>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Mot de passe</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background/80 pr-3 pl-9 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                />
              </span>
            </label>

            <button
              type="submit"
              className="shine flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Se connecter <ArrowRight className="h-4 w-4" />
            </button>

            <div className="rounded-xl border border-accent/40 bg-accent-soft p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
                <Sparkles className="h-4 w-4" /> Accès démonstration
              </p>
              <p className="mt-1 text-xs text-accent-foreground/80">
                Identifiants pré-remplis — entrez directement dans l'environnement de démonstration.
              </p>
              <button
                type="button"
                onClick={() => enter(true)}
                className="shine mt-3 h-10 w-full rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Connexion instantanée (démo)
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={greenhouse}
          alt="Récolte de fruits rouges dans une serre AM Grow"
          width={1024}
          height={1536}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/70 to-primary-glow/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="font-display text-4xl font-extrabold">AM Grow Control</h2>
          <p className="mt-3 max-w-md text-lg text-primary-foreground/85">
            Toute votre ferme, dans un seul endroit — sans rien déconnecter de ce qui marche déjà.
          </p>
          <p className="mt-6 text-sm text-primary-foreground/70">
            Sidi Ouassay, Agadir · Maraîchage & fruits rouges · Export
          </p>
        </div>
      </div>
    </div>
  );
}
