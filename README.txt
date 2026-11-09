MESSEJAGTEN – FØRSTE HJEMMESIDEVERSION

Indhold: index.html, style.css, app.js

Denne version tester oprettelse af hold fra GitHub Pages via Supabase.
Den viser holdkoden og gemmer holdets session lokalt på samme telefon.

BEGRÆNSNING: Opgaver, svar, genoptagelse via holdkode, point og administration
kommer i efterfølgende versioner. "Fortsæt" viser kun det gemte hold.

GitHub: Upload de tre filer til roden af repository Messejagten.
GitHub Pages: main / (root).
Adresse: https://specialminds3-blip.github.io/Messejagten/
Test med arrangementskoden TEST2026 og et NYT holdnavn.

OBS: Hvis et andet hold allerede har samme navn i arrangementet,
vil databasen afvise oprettelsen. Det er forventet.

Sikkerhed: Supabase publishable key må ligge i browserkode.
Databasepassword, service_role og secret keys må ALDRIG lægges i GitHub.
Holdets session-token gemmes i localStorage; brug ikke delt computer til rigtige hold.

Hvis API-kaldet fejler, bør vi kontrollere SQL-funktionens EXECUTE-rettigheder
og Data API's eksponering af public-funktioner (ikke kun tabeller).
