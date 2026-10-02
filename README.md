# Recouvrement

Plateforme de recouvrement en français. Un administrateur crée des dossiers débiteurs, planifie des appels sortants, et suit le journal : planifié, en cours, terminé, échec, ou simulation locale.

Twilio compose le numéro. ElevenLabs Conversational AI prend la voix quand la personne décroche. Sans ces clés, en développement seulement, le déclencheur marque l'appel « Simulation locale » et ne compose aucun numéro. En production, une configuration incomplète met l'appel en échec.

## Fonctions

- Dossiers : création, liste, statut (ouvert, en relance, clos)
- Appel planifié sur un dossier (date, heure de Paris, téléphone)
- Journal des appels avec heures de début et de fin
- Bouton « Lancer les appels dus » et route `GET` ou `POST /api/appels/declencher`
- Connexion par mot de passe administrateur (cookie httpOnly signé)

## Lancer en local

```bash
npm install
npm run dev
```

Copiez `.env.example` vers `.env.local`. Pour un essai sans Neon ni téléphonie, renseignez seulement `AUTH_SECRET` et `ADMIN_PASSWORD`.

Créez un dossier, planifiez un appel à l'heure actuelle, ouvrez le journal, puis lancez les appels dus. Le statut doit devenir « Simulation locale », avec un texte qui dit qu'aucun numéro n'a été composé.

## Variables d'environnement

Noms uniquement, toutes côté serveur. Voir `.env.example`.

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_PASSWORD`
- `APP_BASE_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `CRON_SECRET`

## Base de données

Exécutez `db/schema.sql` une fois dans l'éditeur SQL Neon. Le script crée `dossiers` et `appels`.

Sans `DATABASE_URL`, et seulement hors production, les données restent dans `data/recouvrement.json`. Ce fichier peut contenir des numéros : il est ignoré par git.

## Twilio et ElevenLabs

1. Créez un agent ElevenLabs (Conversational AI), de préférence en français. Dans le premier message ou le prompt, vous pouvez utiliser `{{nom_debiteur}}`, `{{montant}}`, `{{reference}}` et `{{telephone}}`.
2. Notez l'identifiant de l'agent (`ELEVENLABS_AGENT_ID`) et une clé API (`ELEVENLABS_API_KEY`).
3. Dans Twilio, prenez un numéro capable d'émettre des appels vocaux, au format international (`TWILIO_FROM_NUMBER`, par exemple `+33123456789`), plus le SID du compte et le jeton.
4. Déployez l'application sur une URL https et mettez-la dans `APP_BASE_URL`.
5. Le déclencheur appelle l'API Twilio `Calls`. Twilio demande ensuite `POST /api/twilio/voix`, qui enregistre l'appel chez ElevenLabs (`/v1/convai/twilio/register-call`) et renvoie le TwiML. Les changements d'état arrivent sur `POST /api/twilio/statut`. Les deux routes vérifient la signature Twilio.
6. Pour le cron Vercel, définissez `CRON_SECRET`. La route `/api/appels/declencher` attend `Authorization: Bearer <CRON_SECRET>`. Le fichier `vercel.json` la déclenche toutes les 5 minutes. Le bouton du journal fait le même travail pour une session administrateur, sans ce secret.

Un compte Twilio d'essai ne peut appeler que des numéros vérifiés.

L'application tente d'imposer un premier message en français et le nom du débiteur. Si l'agent refuse cette surcharge, elle réessaie avec les variables dynamiques seules. Le numéro Twilio n'a pas besoin d'être importé dans ElevenLabs : l'appel reste sur votre compte Twilio.

## Hors de ce périmètre

Pas de relance entrante, pas d'annulation d'un appel déjà confié à Twilio, pas de transcription, pas de promesse de paiement, pas de plusieurs utilisateurs, pas de reprise automatique d'un appel resté « en cours » si le processus s'arrête après la prise en charge.
