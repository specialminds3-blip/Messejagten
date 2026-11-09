'use strict';
const URL_BASE='https://okpjptrfelurdhozcwgm.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_hoV9qSssWgGZflf5F12C0Q_T_R1xLAE';
const STORAGE='messejagten-team-v1';
const $=id=>document.getElementById(id);
let saved=null;
try{saved=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch{}
const qs=new URLSearchParams(location.search);
if(qs.has('kode'))$('code').value=qs.get('kode');
if(saved)$('resumeBtn').hidden=false;
function error(msg){$('notice').textContent=msg;$('notice').hidden=false;window.scrollTo({top:0,behavior:'smooth'})}
function showTeam(data){$('notice').hidden=true;$('join').hidden=true;$('ready').hidden=false;$('teamTitle').textContent=data.name;$('teamCode').textContent=data.holdkode||'(gemt tidligere – koden vises kun ved oprettelse)'}
$('resumeBtn').addEventListener('click',()=>{if(saved)showTeam(saved)});
$('newBtn').addEventListener('click',()=>{$('ready').hidden=true;$('join').hidden=false});
$('copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('teamCode').textContent);$('copyBtn').textContent='Kopieret!'}catch{error('Kunne ikke kopiere automatisk. Markér koden og kopiér den.')}});
$('joinForm').addEventListener('submit',async e=>{e.preventDefault();const btn=$('joinBtn');btn.disabled=true;btn.textContent='Opretter hold…';$('notice').hidden=true;const name=$('team').value.trim();try{const res=await fetch(URL_BASE+'/rest/v1/rpc/opret_messehold',{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLISHABLE_KEY,'Authorization':'Bearer '+PUBLISHABLE_KEY},body:JSON.stringify({p_arrangementskode:$('code').value.trim(),p_holdnavn:name})});let body=await res.json();if(!res.ok)throw new Error(body.message||'Kunne ikke oprette hold');const record=Array.isArray(body)?body[0]:body;if(!record?.hold_id||!record?.session_token)throw new Error('Supabase returnerede ikke holdoplysninger. Kontrollér Data API og funktionens rettigheder.');saved={id:record.hold_id,holdkode:record.holdkode,token:record.session_token,name};localStorage.setItem(STORAGE,JSON.stringify(saved));showTeam(saved)}catch(err){error(err.message||'Der opstod en fejl')}finally{btn.disabled=false;btn.textContent='Opret hold'}});
