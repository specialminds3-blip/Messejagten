Messejagten 7.2 – genoptagelse af hold på anden telefon

Upload alle webfiler til GitHub Pages (samme mappe som version 7.1).
Kræver at public.genoptag_messehold(text,text) er oprettet i Supabase.

TEST:
1. Opret et testhold og gem holdkoden (12 hextegn).
2. Gem en tekstbesvarelse og evt. et billede.
3. Åbn hjemmesiden på en anden telefon eller i privat browser.
4. Tryk Genoptag hold på en anden telefon, angiv arrangementskode og holdkode.
5. Kontrollér at holdnavn, opgaver og besvarelser hentes.
6. Den gamle telefons session er nu ugyldig. Den kan genoptage med holdkoden igen.

SIKKERHED FØR OFFENTLIG BRUG:
RPC-funktionen bør beskyttes med serverbaseret rate limiting mod gentagne gæt på holdkoder.
Bemærk: Holdkode er en adgangsnøgle. Del den ikke offentligt.
