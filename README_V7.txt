MESSEJAGTEN VERSION 7 – FOTOOPGAVER OG MANUEL BEDØMMELSE

Indhold:
- Deltager: Fotoopgaver med JPG/PNG/WebP fra kamera eller galleri, max 10 MB.
- Billeder uploades gennem Edge Function upload-messebillede til privat bucket.
- Fotoets sti gemmes via gem_messebesvarelse.
- Administrator: Visning af fotos fra afleverede hold med tidsbegrænsede signed URLs.
- Administrator: Manuel pointgivning (opret/opdater bedoemmelser) og opdatering af ranglisten.

INSTALLATION
1. Behold en kopi af den eksisterende GitHub-version.
2. Upload filerne i denne mappe til roden af dit GitHub Pages-repository.
3. Kontrollér at Edge Function upload-messebillede er deployed, og at legacy JWT verification er OFF.
4. Kontrollér at storage-bucket messejagt-billeder er privat, og at kun administrator har Storage-adgang.
5. Opret en fotoopgave i admin. Brug et NYT testhold, fordi opgaver tildeles ved holdoprettelse.
6. Upload foto, gem svar, aflever holdet, og kontrollér billedet og point i admin.

BEMÆRK
- Ingen SQL-ændringer er med i ZIP-filen. Forudsætter eksisterende SQL-funktioner og RLS.
- Administratorens INSERT/UPDATE-rettigheder til bedoemmelser skal være tilladt i Supabase.
- Hent_messeopgaver bør returnere billede_sti for at kunne genkende gemte fotos efter genindlæsning.
- Der er endnu ikke automatisk billedsletning efter 30 dage.
- Hvis en upload lykkes, men gem_messebesvarelse fejler, kan der opstå et ubrugt billede; dette skal håndteres før offentlig brug.
- Upload-funktionen skal sikkerhedsgennemgås og testes før rigtig drift.
