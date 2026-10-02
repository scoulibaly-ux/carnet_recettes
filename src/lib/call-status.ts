import type { AppelStatus } from "@/lib/labels";

export function mapTwilioCallStatus(callStatus: string): Extract<AppelStatus, "en_cours" | "termine" | "echec"> | null {
  switch (callStatus) {
    case "queued":
    case "initiated":
    case "ringing":
    case "in-progress":
    case "answered":
      return "en_cours";
    case "completed":
      return "termine";
    case "busy":
    case "failed":
    case "no-answer":
    case "canceled":
    case "cancelled":
      return "echec";
    default:
      return null;
  }
}

export function twilioFailureDetail(callStatus: string) {
  switch (callStatus) {
    case "busy":
      return "Le correspondant est occupé.";
    case "no-answer":
      return "Pas de réponse.";
    case "canceled":
    case "cancelled":
      return "L'appel a été annulé.";
    default:
      return "L'appel Twilio a échoué.";
  }
}
