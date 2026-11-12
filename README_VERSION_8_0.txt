MESSEJAGTEN 8.0

Ændringer:
- Storskærmsslideshow viser live-rangliste i højre side (kun slideshow.html).
- Opret et andet hold-knappen er fjernet fra deltagersiden.
- Efter aflevering kan deltageren åbne et billedslideshow uden rangliste.
- Slet arrangement-knappen er mindre og højrestillet.

INSTALLATION:
1. Upload de opdaterede hjemmesidefiler fra denne ZIP til GitHub Pages som normalt.
2. Mobilslideshowet kræver desuden installation af Supabase Edge Function:
   supabase/functions/messe-slideshow/index.ts
   Deploy funktionen under navnet messe-slideshow med JWT-verifikation SLÅET FRA (--no-verify-jwt).
   Funktionen kontrollerer selv holdets session via den eksisterende
   hent_offentlig_rangliste-RPC og kræver, at holdet har afleveret.
   SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY skal være serverhemmeligheder
   i Supabase (ALDRIG i GitHub-hjemmesidefilerne).
3. Der kræves ingen ny SQL til disse ændringer.
4. Test først på et afleveret testhold. Test også at en ugyldig holdsession
   ikke kan hente billeder.

VIGTIGT: Mobilslideshowet virker først, når Edge Function er deployet.
Ranglisten på storskærmen opdateres hvert 15. sekund, billeder hvert 30.
Slideshowet på mobil henter nye links ved hver gennemspilning.
