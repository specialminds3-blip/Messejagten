MESSEJAGTEN VERSION 4

Upload disse filer til roden af GitHub-repositoryet Messejagten:
index.html, app.js, style.css, admin.html, admin.js, admin.css

Deltagerside: https://specialminds3-blip.github.io/Messejagten/
Administrator: https://specialminds3-blip.github.io/Messejagten/admin.html

Admin logger ind med eksisterende Supabase Authentication-bruger.
Kontrollen er baseret på public.er_administrator() og eksisterende RLS.
Administratorsiden er kun læsning og viser hold, status, point og tider.

VIGTIGT:
- Test login og oversigt med din administratorbruger.
- Der skal være SELECT-privilegier og RLS-adgang til besvarelser og bedoemmelser.
- Ranglisten på admin-siden er privat; offentliggørelse til deltagere er endnu ikke lavet.
- Gemte adgangstokens ligger kun i browserens sessionStorage for administratorsiden.
- Administratorsiden bruger ikke public.messe_rangliste-viewet, men udregner ranglisten ud fra RLS-beskyttede tabeller.
- Hvis der findes flere bedømmelser pr. besvarelse, lægges de sammen; normal drift bør sikre én gældende bedømmelse pr. besvarelse.
