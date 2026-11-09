MESSEJAGTEN VERSION 2
Upload index.html, style.css og app.js direkte i roden af GitHub-repository Messejagten og overskriv de gamle filer.
Denne version kræver Supabase RPC: opret_messehold(text,text), hent_messeopgaver(uuid,text), gem_messebesvarelse(uuid,text,uuid,text,jsonb,text).
Virker: holdoprettelse, fortsæt på samme telefon, opgavevisning, multiple choice, tekstsvar, gem/rediger svar, navigation, lokal spring-over-markering og oversigt.
Ikke implementeret endnu: endelig aflevering, billedupload, synkronisering af spring-over-markering mellem enheder, genoptagelse via holdkode på ny telefon, point/rangliste/admin.
VIGTIGT: Kontrollér RLS og direkte Data API-rettigheder til opgaver/facit før offentlig brug. Brug ikke hemmelige service_role keys i browseren.
