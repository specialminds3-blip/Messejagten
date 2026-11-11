MESSEJAGTEN VERSION 7.2 – GENOPTAG MED HOLDKODE

Indhold: komplet hjemmeside inkl. admin fra version 7.1.

NYT:
- Genoptag hold fra en anden telefon med arrangementskode og 12-tegns holdkode.
- Eksisterende besvarelser hentes via hent_messeopgaver.
- Det nye session-token gemmes lokalt på den nye telefon.
- Den gamle telefon mister adgang efter genoptagelsen.

FORUDSÆTNING I SUPABASE:
Funktionen public.genoptag_messehold(text,text) skal være oprettet og give
EXECUTE til anon, authenticated. Dette er allerede udført i SQL Editor.

INSTALLATION:
Upload filerne fra Messejagten-main til roden af GitHub-repositoriet.
Behold eksisterende Supabase-projekt, Edge Function og Storage-bucket.
Test først med et testhold og to telefoner/browsere.

SIKKERHED FØR OFFENTLIG BRUG:
Holdkoden er en adgangsnøgle. Den nye RPC-funktion bør beskyttes mod
masseforsøg med serverbaseret rate limiting og evt. låsning ved mange fejl.
Uden dette bør løsningen kun testes kontrolleret.

OBS: Når et hold genoptages, roteres session-tokenet, og gammel telefon
kan ikke længere gemme eller hente svar. Holdkoden bør ikke deles offentligt.
