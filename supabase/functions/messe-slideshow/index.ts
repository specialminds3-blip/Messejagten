// Supabase Edge Function. Deploy med --no-verify-jwt; session kontrolleres her.
import { createClient } from 'npm:@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return reply({error:'Metode ikke tilladt'},405);
 try{
  const {p_hold_id,p_session_token}=await req.json();
  if(typeof p_hold_id!=='string'||typeof p_session_token!=='string'||p_session_token.length>300)return reply({error:'Ugyldig holdsession'},401);
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const db=createClient(url,key,{auth:{persistSession:false}});
  // Valider mod eksisterende sikkerheds-RPC, som kun tillader afleveringens holdsession.
  const {data:ranking,error:authError}=await db.rpc('hent_offentlig_rangliste',{p_hold_id,p_session_token});
  if(authError||!Array.isArray(ranking))return reply({error:'Holdsession er ikke gyldig eller holdet har ikke afleveret'},403);
  const {data:team,error:teamError}=await db.from('hold').select('arrangement_id,status').eq('id',p_hold_id).single();
  if(teamError||!team||team.status!=='afleveret')return reply({error:'Kun afleverede hold kan se billeder'},403);
  const {data:tasks,error:taskError}=await db.from('opgaver').select('id,titel').eq('arrangement_id',team.arrangement_id).eq('type','foto');
  if(taskError)throw taskError;
  const ids=(tasks||[]).map(t=>t.id);if(!ids.length)return reply({photos:[]});
  const {data:teams,error:teamsError}=await db.from('hold').select('id,navn').eq('arrangement_id',team.arrangement_id).limit(5000);
  if(teamsError)throw teamsError;
  const names=new Map((teams||[]).map(t=>[t.id,t.navn]));const titles=new Map((tasks||[]).map(t=>[t.id,t.titel]));
  const photos=[];
  for(let offset=0;offset<10000;offset+=500){
   const {data:answers,error}=await db.from('besvarelser').select('id,hold_id,opgave_id,billede_sti').in('opgave_id',ids).not('billede_sti','is',null).order('id').range(offset,offset+499);
   if(error)throw error;
   for(const a of answers||[]){if(!names.has(a.hold_id)||!titles.has(a.opgave_id))continue;
    const {data:signed,error:signError}=await db.storage.from('messejagt-billeder').createSignedUrl(a.billede_sti,180);
    if(!signError&&signed?.signedUrl)photos.push({id:a.id,team:names.get(a.hold_id),task:titles.get(a.opgave_id),url:signed.signedUrl});
   }
   if((answers||[]).length<500)break;
  }
  return reply({photos});
 }catch(e){return reply({error:'Kunne ikke hente slideshow'},500)}
});
