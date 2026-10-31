"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionButton } from "@/components/ui-aesbt/ActionButton";
import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";
import { envoyerMessageContact } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Motifs proposés dans la liste déroulante. `label` est ce qui est affiché et
 * envoyé au back-office comme sujet du message ; `hint` guide la rédaction.
 */
const MOTIFS = [
  {
    value: "partenariat",
    label: "Partenariat",
    hint: "Présentez votre organisation et votre idée de collaboration.",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    hint: "Une idée pour améliorer l'association ou le site ?",
  },
  {
    value: "information",
    label: "Demande d'information",
    hint: "Posez votre question, nous vous répondons.",
  },
  {
    value: "adhesion",
    label: "Adhésion et inscription",
    hint: "Précisez votre situation (ville, université, année).",
  },
  {
    value: "evenement",
    label: "Événement ou intervention",
    hint: "Indiquez la date, le lieu et le public concerné.",
  },
  { value: "presse", label: "Presse et médias", hint: "Précisez votre média et votre demande." },
  {
    value: "probleme",
    label: "Signaler un problème",
    hint: "Décrivez ce qui ne fonctionne pas, et sur quelle page.",
  },
  { value: "autre", label: "Autre", hint: "Dites-nous tout." },
] as const;

const FIELD =
  "w-full rounded-lg border border-line bg-surface/80 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-shadow placeholder:text-muted-ink/60 focus:ring-2 focus:ring-accent-blue/40";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [erreur, setErreur] = useState<string | null>(null);
  const [motif, setMotif] = useState<string>("");
  const [motifManquant, setMotifManquant] = useState(false);
  const [popupOuverte, setPopupOuverte] = useState(false);
  const [motifEnvoye, setMotifEnvoye] = useState<string>("");

  const motifChoisi = MOTIFS.find((m) => m.value === motif);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formulaire = e.currentTarget;
    const donnees = new FormData(formulaire);

    if (!motifChoisi) {
      setMotifManquant(true);
      return;
    }

    setStatus("loading");
    setErreur(null);

    const resultat = await envoyerMessageContact({
      nom: String(donnees.get("name") ?? ""),
      email: String(donnees.get("email") ?? ""),
      sujet: motifChoisi.label,
      message: String(donnees.get("message") ?? ""),
    });

    if (resultat.ok) {
      setStatus("success");
      setMotifEnvoye(motifChoisi.label);
      formulaire.reset();
      setMotif("");
    } else {
      setStatus("error");
      setErreur(resultat.message ?? null);
    }
    setPopupOuverte(true);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">Nom complet</span>
          <input required name="name" autoComplete="name" className={FIELD} />
        </label>
        <label className="grid gap-2">
          <span className="text-[13px] font-medium text-ink">E-mail</span>
          <input required type="email" name="email" autoComplete="email" className={FIELD} />
        </label>
      </div>

      <div className="grid gap-2">
        <span id="motif-label" className="text-[13px] font-medium text-ink">
          Motif de votre message
        </span>
        <Select
          value={motif}
          onValueChange={(valeur) => {
            setMotif(valeur);
            setMotifManquant(false);
          }}
        >
          <SelectTrigger
            aria-labelledby="motif-label"
            aria-invalid={motifManquant}
            className="h-auto rounded-lg border-line bg-surface/80 px-3.5 py-2.5 text-[15px] text-ink shadow-none aria-[invalid=true]:border-accent-red"
          >
            <SelectValue placeholder="Choisir un motif" />
          </SelectTrigger>
          <SelectContent>
            {MOTIFS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {motifManquant ? (
          <p role="alert" className="text-[13px] text-accent-red">
            Choisissez le motif de votre message.
          </p>
        ) : motifChoisi ? (
          <p className="text-[13px] text-muted-ink">{motifChoisi.hint}</p>
        ) : null}
      </div>

      <label className="grid gap-2">
        <span className="text-[13px] font-medium text-ink">Message</span>
        <textarea
          required
          minLength={10}
          name="message"
          rows={6}
          className={FIELD}
          placeholder="Écrivez votre message ici (10 caractères minimum)"
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <ActionButton type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
        </ActionButton>
      </div>

      <StatusDialog
        open={popupOuverte}
        onOpenChange={setPopupOuverte}
        variant={status === "success" ? "success" : "error"}
        title={status === "success" ? "Message envoyé" : "Envoi impossible"}
        description={
          status === "success"
            ? `Merci ! Votre message (${motifEnvoye}) est bien arrivé. Le Bureau Exécutif vous répondra par e-mail.`
            : (erreur ?? "L'envoi a échoué. Réessayez plus tard.")
        }
        action={{ label: status === "success" ? "Fermer" : "Réessayer" }}
      />
    </form>
  );
}
