import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapTwilioCallStatus } from "./call-status";
import { parseEurosToCents } from "./money";
import { parisLocalToUtc, toParisDateTimeLocal } from "./paris-time";
import { normalizePhone } from "./phones";
import { decideTelephony } from "./telephony-mode";
import { twilioSignatureValid } from "./twilio-signature";

const completeEnv = {
  TWILIO_ACCOUNT_SID: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  TWILIO_AUTH_TOKEN: "token",
  TWILIO_FROM_NUMBER: "+33123456789",
  ELEVENLABS_API_KEY: "xi",
  ELEVENLABS_AGENT_ID: "agent",
  APP_BASE_URL: "https://recouvrement.example",
};

describe("téléphone", () => {
  it("accepte un mobile français", () => {
    assert.equal(normalizePhone("06 12 34 56 78"), "+33612345678");
    assert.equal(normalizePhone("0033612345678"), "+33612345678");
    assert.equal(normalizePhone("+1 202 555 0123"), "+12025550123");
  });

  it("refuse un numéro trop court", () => {
    assert.equal(normalizePhone("0612"), null);
  });
});

describe("montant", () => {
  it("convertit les euros en centimes", () => {
    assert.equal(parseEurosToCents("1 250,50"), 125050);
    assert.equal(parseEurosToCents("10"), 1000);
  });

  it("refuse zéro et les décimales en trop", () => {
    assert.equal(parseEurosToCents("0"), null);
    assert.equal(parseEurosToCents("10.999"), null);
  });
});

describe("heure de Paris", () => {
  it("convertit l'été et l'hiver", () => {
    assert.equal(parisLocalToUtc("2026-10-02T15:30")?.toISOString(), "2026-10-02T13:30:00.000Z");
    assert.equal(parisLocalToUtc("2026-01-15T15:30")?.toISOString(), "2026-01-15T14:30:00.000Z");
  });

  it("rejette une date impossible", () => {
    assert.equal(parisLocalToUtc("2026-02-31T10:00"), null);
  });

  it("retrouve l'heure locale", () => {
    const utc = new Date("2026-10-02T13:30:00.000Z");
    assert.equal(toParisDateTimeLocal(utc), "2026-10-02T15:30");
  });
});

describe("mode téléphonie", () => {
  it("reste local seulement hors production et sans aucune clé", () => {
    assert.equal(decideTelephony({}, "development").mode, "local");
    assert.equal(decideTelephony({}, "production").mode, "non_configure");
  });

  it("n'appelle pas si la configuration est partielle", () => {
    const decision = decideTelephony({ TWILIO_ACCOUNT_SID: "AC123" }, "development");
    assert.equal(decision.mode, "non_configure");
  });

  it("passe en réel quand tout est https et complet", () => {
    assert.equal(decideTelephony(completeEnv, "production").mode, "reel");
    assert.equal(
      decideTelephony({ ...completeEnv, APP_BASE_URL: "http://localhost:3000" }, "development").mode,
      "non_configure",
    );
  });
});

describe("signature Twilio", () => {
  it("valide l'exemple de la documentation", () => {
    const valid = twilioSignatureValid({
      authToken: "12345",
      signature: "RSOYDt4T1cUTdK1PDd93/VVr8B8=",
      url: "https://mycompany.com/myapp.php?foo=1&bar=2",
      params: {
        CallSid: "CA1234567890ABCDE",
        Caller: "+14158675309",
        Digits: "1234",
        From: "+14158675309",
        To: "+18005551212",
      },
    });
    assert.equal(valid, true);
  });
});

describe("statut Twilio", () => {
  it("mappe les états utiles", () => {
    assert.equal(mapTwilioCallStatus("in-progress"), "en_cours");
    assert.equal(mapTwilioCallStatus("completed"), "termine");
    assert.equal(mapTwilioCallStatus("no-answer"), "echec");
    assert.equal(mapTwilioCallStatus("unknown"), null);
  });
});
