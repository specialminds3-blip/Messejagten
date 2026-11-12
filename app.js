'use strict';
const URL_BASE='https://okpjptrfelurdhozcwgm.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_hoV9qSssWgGZflf5F12C0Q_T_R1xLAE';
const STORAGE='messejagten-team-v1';
const $=id=>document.getElementById(id);
let saved=null,tasks=[],current=0,skipped=new Set();
try{saved=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch{}
const qs=new URLSearchParams(location.search);
if(qs.has('kode')){$('code').value=qs.get('kode');$('recoveryCode').value=qs.get('kode')}
if(saved?.id&&saved?.token)$('resumeBtn').hidden=false;
function error(msg){$('notice').textContent=msg;$('notice').hidden=false;window.scrollTo({top:0,behavior:'smooth'})}
function clearError(){$('notice').hidden=true}
async function rpc(name,args){const res=await fetch(URL_BASE+'/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLISHABLE_KEY,'Authorization':'Bearer '+PUBLISHABLE_KEY},body:JSON.stringify(args)});const data=await res.json();if(!res.ok)throw new Error(data.message||'Der opstod en fejl');return data}
function auth(){return {p_hold_id:saved.id,p_session_token:saved.token}}
function showTeam(data){clearError();$('join').hidden=true;$('game').hidden=false;$('teamTitle').textContent=data.name;$('teamCode').textContent=data.holdkode||'Kun vist ved oprettelse';$('codeArea').hidden=!data.holdkode;if(data.submitted){showFinished();return}loadTasks()}
function showFinished(){clearError();$('taskArea').hidden=true;$('summary').hidden=true;$('finished').hidden=false;$('progress').textContent='Afleveret';$('finishedTeam').textContent=saved?.name||'Jeres hold';$('finishedPoints').textContent='–';$('finishedPlace').textContent='–';$('resultsBtn').textContent='Se hele ranglisten';$('resultsStatus').textContent='Henter jeres resultat…';$('publicResults').hidden=true;loadPublicResults(false)}
async function loadTasks(){try{const data=await rpc('hent_messeopgaver',auth());tasks=Array.isArray(data)?data:[];if(!tasks.length){error('Der er endnu ingen opgaver til holdet.');return}current=Math.min(current,tasks.length-1);renderTask()}catch(e){error('Kunne ikke hente opgaver: '+e.message)}}
async function uploadPhoto(task,file){
  if(!file)throw new Error('Vælg et billede først');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Brug JPG, PNG eller WebP');
  if(file.size>10*1024*1024)throw new Error('Billedet må højst fylde 10 MB');
  const form=new FormData();form.append('hold_id',saved.id);form.append('session_token',saved.token);form.append('opgave_id',task.opgave_id);form.append('file',file,file.name);
  const response=await fetch(URL_BASE+'/functions/v1/upload-messebillede',{method:'POST',headers:{'apikey':PUBLISHABLE_KEY},body:form});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.success||!data.billede_sti)throw new Error(data.error||'Billedet kunne ikke uploades (HTTP '+response.status+')');
  return data.billede_sti;
}
function answerValue(task){if(task.type==='multiple_choice'){return document.querySelector('input[name="choice"]:checked')?.value||''}return $('answerInput')?.value.trim()||''}
function renderTask(){if(saved?.submitted){showFinished();return}clearError();$('finished').hidden=true;$('summary').hidden=true;$('taskArea').hidden=false;const t=tasks[current];$('progress').textContent=`${current+1} / ${tasks.length}`;$('taskCount').textContent=`Opgave ${current+1} af ${tasks.length}`;$('taskTitle').textContent=t.titel||'Opgave';$('taskDescription').textContent=t.beskrivelse||'';const area=$('answerArea');area.replaceChildren();const value=t.svar_tekst??(typeof t.svar_json==='string'?t.svar_json:'');if(t.type==='multiple_choice'){let opts=t.svarmuligheder;if(typeof opts==='string'){try{opts=JSON.parse(opts)}catch{opts=[]}}if(!Array.isArray(opts))opts=[];for(const [i,opt] of opts.entries()){const label=document.createElement('label');label.className='choice';const radio=document.createElement('input');radio.type='radio';radio.name='choice';radio.value=String(opt);radio.checked=String(opt)===String(value);label.append(radio,document.createTextNode(' '+String(opt)));area.append(label)}if(!opts.length){const p=document.createElement('p');p.textContent='Der er ingen svarmuligheder til denne opgave.';area.append(p)}}else if(t.type==='foto'){const label=document.createElement('label');label.htmlFor='photoInput';label.textContent='Tag et billede eller vælg fra galleriet';const file=document.createElement('input');file.type='file';file.id='photoInput';file.accept='image/jpeg,image/png,image/webp';file.addEventListener('change',()=>{const selected=file.files?.[0];$('saveStatus').textContent=selected?'Valgt: '+selected.name:'Intet billede valgt'});area.append(label,file);const notice=document.createElement('p');notice.className='muted';notice.textContent='Billeder taget til Messejagten vil blive vist i slideshow ved Special Minds – Aalborgs messestand!';area.append(notice);if(t.billede_sti){const info=document.createElement('p');info.className='muted';info.textContent='✓ Et billede er tidligere gemt. Vælg et nyt for at udskifte det.';area.append(info)}}else{const textarea=document.createElement('textarea');textarea.id='answerInput';textarea.rows=4;textarea.maxLength=5000;textarea.placeholder=t.type==='foto'?'Fotoopgaver kommer i en senere version. Du kan skrive en note her.':'Skriv jeres svar her';textarea.value=value;area.append(textarea)}$('saveStatus').textContent=skipped.has(t.opgave_id)?'Sprunget over på denne telefon':((value||t.billede_sti)?'Tidligere svar hentet fra Supabase':'Intet svar gemt endnu');$('prevBtn').disabled=current===0;$('nextBtn').textContent=current===tasks.length-1?'Se oversigt':'Næste'}
async function saveAnswer(){
  if(saved?.submitted){showFinished();return false}
  const t=tasks[current];const value=t.type==='foto'?'':answerValue(t);const file=t.type==='foto'?$('photoInput')?.files?.[0]:null;
  if(t.type==='foto'&&!file&&!t.billede_sti){error('Vælg et billede først, eller brug Spring over.');return false}
  if(t.type!=='foto'&&!value){error('Skriv eller vælg et svar først. Brug Spring over, hvis I vil videre uden svar.');return false}
  const btn=$('saveBtn');btn.disabled=true;$('saveStatus').textContent=file?'Uploader billede…':'Gemmer…';
  try{
    const path=file?await uploadPhoto(t,file):(t.type==='foto'?t.billede_sti:null);
    await rpc('gem_messebesvarelse',{...auth(),p_opgave_id:t.opgave_id,p_svar_tekst:value||null,p_svar_json:value||null,p_billede_sti:path});
    t.svar_tekst=value||null;t.svar_json=value||null;t.billede_sti=path;skipped.delete(t.opgave_id);clearError();$('saveStatus').textContent='✓ Svaret er gemt i Supabase';return true
  }catch(e){error('Svaret blev ikke gemt: '+e.message);$('saveStatus').textContent='Kunne ikke gemme';return false}finally{btn.disabled=false}
}
function summary(){if(saved?.submitted){showFinished();return}clearError();$('taskArea').hidden=true;$('summary').hidden=false;const list=$('summaryList');list.replaceChildren();tasks.forEach((t,i)=>{const b=document.createElement('button');b.className='secondary summaryButton';b.textContent=`${i+1}. ${t.titel} — ${(t.svar_tekst!=null||t.billede_sti)?'Besvaret':skipped.has(t.opgave_id)?'Sprunget over':'Mangler svar'}`;b.addEventListener('click',()=>{current=i;renderTask()});list.append(b)})}
$('submitBtn').addEventListener('click',async()=>{
  if(!saved?.id||!saved?.token||saved.submitted)return;
  if(!window.confirm('Vil I aflevere Messejagten nu? Efter aflevering kan I ikke ændre svarene.'))return;
  const btn=$('submitBtn');btn.disabled=true;btn.textContent='Afleverer…';clearError();
  try{
    const result=await rpc('aflever_messejagt',auth());
    if(result!==true)throw new Error('Afleveringen blev ikke bekræftet');
    saved.submitted=true;localStorage.setItem(STORAGE,JSON.stringify(saved));showFinished();
  }catch(e){error('Afleveringen lykkedes ikke: '+e.message);btn.disabled=false;btn.textContent='Aflever Messejagten'}
});
$('resumeBtn').addEventListener('click',()=>{if(saved)showTeam(saved)});
$('showRecoveryBtn').addEventListener('click',()=>{clearError();$('recoveryForm').hidden=false;$('showRecoveryBtn').hidden=true;$('recoveryCode').value=$('recoveryCode').value||$('code').value;$('recoveryTeamCode').focus()});
$('cancelRecoveryBtn').addEventListener('click',()=>{$('recoveryForm').hidden=true;$('showRecoveryBtn').hidden=false;clearError()});
$('recoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();clearError();const btn=$('recoverBtn');btn.disabled=true;btn.textContent='Genoptager…';
  try{
    const arrangement=$('recoveryCode').value.trim();const holdkode=$('recoveryTeamCode').value.trim().toLowerCase();
    if(!/^[0-9a-f]{12}$/.test(holdkode))throw new Error('Holdkoden skal bestå af 12 tegn (0-9 og a-f)');
    if(saved?.id&&!window.confirm('Dette erstatter det hold, som er gemt på denne telefon. Fortsæt?'))return;
    const data=await rpc('genoptag_messehold',{p_arrangementskode:arrangement,p_holdkode:holdkode});
    const record=Array.isArray(data)?data[0]:data;
    if(!record?.hold_id||!record?.session_token||!record?.holdnavn)throw new Error('Supabase returnerede ikke gyldige holdoplysninger');
    saved={id:record.hold_id,name:record.holdnavn,token:record.session_token,holdkode,submitted:false};
    localStorage.setItem(STORAGE,JSON.stringify(saved));$('resumeBtn').hidden=false;
    current=0;skipped=new Set();$('recoveryForm').reset();$('recoveryForm').hidden=true;$('showRecoveryBtn').hidden=false;showTeam(saved);
  }catch(err){error('Kunne ikke genoptage hold: '+(err.message||'Ukendt fejl'))}
  finally{btn.disabled=false;btn.textContent='Genoptag hold'}
});
$('showRecoveryBtn').addEventListener('click',()=>{clearError();$('recoveryForm').hidden=false;$('showRecoveryBtn').hidden=true;$('recoveryCode').value=$('code').value.trim()||qs.get('kode')||'';$('recoveryTeamCode').focus()});
$('cancelRecoveryBtn').addEventListener('click',()=>{$('recoveryForm').hidden=true;$('showRecoveryBtn').hidden=false;clearError()});
$('recoveryForm').addEventListener('submit',async e=>{
  e.preventDefault();clearError();const btn=$('recoverBtn');btn.disabled=true;btn.textContent='Genoptager…';
  try{
    const data=await rpc('genoptag_messehold',{p_arrangementskode:$('recoveryCode').value.trim(),p_holdkode:$('recoveryTeamCode').value.trim().toLowerCase()});
    const record=Array.isArray(data)?data[0]:data;
    if(!record?.hold_id||!record?.session_token||!record?.holdnavn)throw new Error('Supabase returnerede ikke gyldige holdoplysninger');
    saved={id:record.hold_id,holdkode:$('recoveryTeamCode').value.trim().toLowerCase(),token:record.session_token,name:record.holdnavn};
    localStorage.setItem(STORAGE,JSON.stringify(saved));$('resumeBtn').hidden=false;current=0;skipped=new Set();showTeam(saved);
  }catch(err){error('Kunne ikke genoptage holdet: '+(err.message||'Ukendt fejl'))}
  finally{btn.disabled=false;btn.textContent='Genoptag hold'}
});

$('copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(saved.holdkode);$('copyBtn').textContent='Kopieret!'}catch{error('Kunne ikke kopiere automatisk.')}});
$('saveBtn').addEventListener('click',async()=>{const ok=await saveAnswer();if(ok && tasks.every(t=>Boolean(t.billede_sti || (t.svar_tekst!=null && String(t.svar_tekst).trim()!==''))))summary();});
$('skipBtn').addEventListener('click',()=>{skipped.add(tasks[current].opgave_id);current++;if(current>=tasks.length)summary();else renderTask()});
$('prevBtn').addEventListener('click',()=>{if(current>0){current--;renderTask()}});
$('nextBtn').addEventListener('click',()=>{current++;if(current>=tasks.length)summary();else renderTask()});
$('backTasks').addEventListener('click',()=>{current=0;renderTask()});
$('joinForm').addEventListener('submit',async e=>{e.preventDefault();const btn=$('joinBtn');btn.disabled=true;btn.textContent='Opretter hold…';clearError();const name=$('team').value.trim();try{const data=await rpc('opret_messehold',{p_arrangementskode:$('code').value.trim(),p_holdnavn:name});const record=Array.isArray(data)?data[0]:data;if(!record?.hold_id||!record?.session_token)throw new Error('Supabase returnerede ikke holdoplysninger');saved={id:record.hold_id,holdkode:record.holdkode,token:record.session_token,name};localStorage.setItem(STORAGE,JSON.stringify(saved));$('resumeBtn').hidden=false;current=0;skipped=new Set();showTeam(saved)}catch(err){error(err.message||'Der opstod en fejl')}finally{btn.disabled=false;btn.textContent='Opret hold'}});

// Ranglisten er synlig for afleverede hold uden manuel offentliggørelse.
async function loadPublicResults(showTable=true){
 const btn=$('resultsBtn');btn.disabled=true;$('resultsStatus').textContent='Henter resultater…';
 if(showTable)$('publicResults').hidden=true;
 try{
  if(!saved?.id||!saved?.token)throw new Error('Holdsession mangler');
  const rows=await rpc('hent_offentlig_rangliste',auth());
  if(!Array.isArray(rows))throw new Error('Uventet svar');
  // Den nuværende Supabase-funktion returnerer holdnavn, men ikke hold-id.
  // Ved navnesammenfald vises ingen usikker individuel placering.
  const matching=rows.filter(r=>r.holdnavn===saved.name);
  const own=matching.length===1?matching[0]:null;
  $('finishedPoints').textContent=own?String(own.point):'–';
  $('finishedPlace').textContent=own?String(own.placering)+'.':'–';
  const body=$('publicResultsBody');body.replaceChildren();
  for(const r of rows){const tr=document.createElement('tr');for(const value of [r.placering,r.holdnavn,r.point,Math.floor(r.tid_sekunder/60)+' min '+(r.tid_sekunder%60)+' sek']){const td=document.createElement('td');td.textContent=String(value);tr.append(td)}body.append(tr)}
  $('resultsStatus').textContent=matching.length>1?'Flere hold har samme navn. Se point og placering i ranglisten.':rows.length?'Resultaterne er opdateret.':'Ingen afleverede hold endnu.';
  $('publicResults').hidden=!showTable||!rows.length;
  btn.textContent=showTable?'Opdater ranglisten':'Se hele ranglisten';
 }catch(e){$('resultsStatus').textContent='Kunne ikke hente resultater: '+e.message}
 finally{btn.disabled=false}
}
$('resultsBtn').addEventListener('click',()=>loadPublicResults(true));

// Deltagernes billedslideshow bruger en særskilt serverfunktion, som kontrollerer holdsessionen.
let mobilePhotos=[],mobileIndex=-1,mobileTimer=null,mobileLoading=false;
async function loadMobilePhotos(){
 if(mobileLoading)return;mobileLoading=true;
 try{
  const response=await fetch(URL_BASE+'/functions/v1/messe-slideshow',{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLISHABLE_KEY,'Authorization':'Bearer '+PUBLISHABLE_KEY},body:JSON.stringify(auth())});
  const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'Slideshowet kunne ikke hentes');
  mobilePhotos=Array.isArray(data.photos)?data.photos:[];
  if(!mobilePhotos.length){$('mobileSlideStatus').textContent='Der er endnu ingen billeder i slideshowet.';return}
  if(mobileIndex<0||mobileIndex>=mobilePhotos.length)mobileIndex=0;
  const photo=mobilePhotos[mobileIndex];$('mobileSlideImage').src=photo.url;
  $('mobileSlideCaption').textContent=photo.team+' · '+photo.task;
  $('mobileSlideCounter').textContent=(mobileIndex+1)+' / '+mobilePhotos.length;
  $('mobileSlideStatus').textContent='';
 }catch(e){$('mobileSlideStatus').textContent=e.message+' (Kontrollér at slideshow-funktionen er installeret i Supabase.)'}finally{mobileLoading=false}
}
$('mobileSlideshowBtn').addEventListener('click',async()=>{
 $('mobileSlideshow').hidden=false;mobileIndex=-1;$('mobileSlideStatus').textContent='Henter billeder…';await loadMobilePhotos();
 clearInterval(mobileTimer);mobileTimer=setInterval(async()=>{
  if(mobilePhotos.length){mobileIndex=(mobileIndex+1)%mobilePhotos.length;const p=mobilePhotos[mobileIndex];$('mobileSlideImage').src=p.url;$('mobileSlideCaption').textContent=p.team+' · '+p.task;$('mobileSlideCounter').textContent=(mobileIndex+1)+' / '+mobilePhotos.length}
  if(mobileIndex===0)await loadMobilePhotos();
 },5000);
});
$('closeMobileSlideshow').addEventListener('click',()=>{clearInterval(mobileTimer);mobileTimer=null;$('mobileSlideshow').hidden=true;$('mobileSlideImage').removeAttribute('src')});
