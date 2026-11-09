MESSEJAGTEN VERSION 3
Upload index.html, style.css og app.js til roden af GitHub-repositoriet.
Ny funktion: Aflever Messejagten med bekræftelse, RPC aflever_messejagt, afslutningsskærm og lokal genkendelse af afleveret hold.
Forudsætter at aflever_messejagt(uuid,text) allerede er oprettet i Supabase.
Bemærk: Afleveringsstatus gemmes lokalt på denne enhed. Serveren afviser ændringer efter aflevering, også på andre enheder.
