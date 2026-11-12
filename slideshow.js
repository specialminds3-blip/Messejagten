'use strict';
// Privat slideshow: samme Supabase-login og administrator-RLS som admin.html.
const BASE='https://okpjptrfelurdhozcwgm.supabase.co',KEY='sb_publishable_hoV9qSssWgGZflf5F12C0Q_T_R1xLAE';
const $=id=>document.getElementById(id);let session=null,events=[],slides=[],position=-1,front=0,cycle=null,poll=null,busy=false,nonce=0;
const headers=t=>({'apikey':KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json'});
async function req(path,opts={}){const r=await fetch(BASE+path,opts),data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.message||data?.error_description||data?.error||'HTTP '+r.status);return data}
async function token(){if(!session)throw Error('Log ind igen');if(Date.now()/1000>=(session.expires_at||0)-60){const d=await req('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});session={...d,expires_at:Math.floor(Date.now()/1000)+d.expires_in}}return session.access_token}
async function adminReq(path,opts={}){let t=await token();return req(path,{...opts,headers:{...headers(t),...(opts.headers||{})}})}
async function verify(){if(await adminReq('/rest/v1/rpc/er_administrator',{method:'POST',body:'{}'})!==true)throw Error('Denne bruger er ikke administrator')}
async function all(table,select,filter=''){const out=[];for(let offset=0;offset<10000;offset+=500){const part=await adminReq('/rest/v1/'+table+'?select='+encodeURIComponent(select)+filter+'&limit=500&offset='+offset);out.push(...part);if(part.length<500)return out}throw Error('For mange poster')}
async function start(){await verify();events=await all('arrangementer','id,titel,status');$('eventSelect').replaceChildren();for(const e of events){const opt=document.createElement('option');opt.value=e.id;opt.textContent=e.titel;$('eventSelect').append(opt)}$('login').hidden=true;$('show').hidden=false;await refresh();await refreshRanking();poll=setInterval(()=>refresh().catch(showError),30000);setInterval(()=>refreshRanking().catch(showError),15000);cycle=setInterval(()=>next().catch(showError),5000)}
function showError(e){$('status').textContent='Opdatering: '+e.message}
async function signed(path){const data=await adminReq('/storage/v1/object/sign/messejagt-billeder/'+path.split('/').map(encodeURIComponent).join('/'),{method:'POST',body:JSON.stringify({expiresIn:120})});if(!data?.signedURL)throw Error('Billedlink kunne ikke oprettes');return data.signedURL.startsWith('http')?data.signedURL:BASE+(data.signedURL.startsWith('/storage/v1/')?data.signedURL:'/storage/v1/'+data.signedURL.replace(/^\/+/,''))}
async function refresh(){if(busy||!$('eventSelect').value)return;busy=true;try{const id=$('eventSelect').value;const teams=await all('hold','id,navn','&arrangement_id=eq.'+encodeURIComponent(id));const tasks=await all('opgaver','id,titel,type','&arrangement_id=eq.'+encodeURIComponent(id));const photos=new Map(tasks.filter(t=>t.type==='foto').map(t=>[t.id,t]));const teamMap=new Map(teams.map(t=>[t.id,t]));let answers=[];for(let i=0;i<teams.length;i+=75){const ids=teams.slice(i,i+75).map(t=>t.id).join(',');answers.push(...await adminReq('/rest/v1/besvarelser?select=id,hold_id,opgave_id,billede_sti&hold_id=in.('+ids+')&billede_sti=not.is.null&limit=10000'))}const previous=slides[position]?.id;slides=answers.filter(a=>photos.has(a.opgave_id)&&teamMap.has(a.hold_id)).map(a=>({...a,team:teamMap.get(a.hold_id).navn,task:photos.get(a.opgave_id).titel})).sort((a,b)=>a.id.localeCompare(b.id));position=slides.findIndex(a=>a.id===previous);$('counter').textContent=slides.length?(Math.max(0,position)+1)+' / '+slides.length:'0 / 0';$('waiting').hidden=slides.length>0;if(!slides.length)$('groupCaption').hidden=true;$('status').textContent='';if(slides.length&&position<0)await next()}catch(e){showError(e)}finally{busy=false}}
async function next(){if(!slides.length)return;const n=(position+1)%slides.length,item=slides[n],run=++nonce;try{const url=await signed(item.billede_sti),img=$('slide'+(front?'A':'B'));await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Billedet kunne ikke indlæses'));img.src=url});if(run!==nonce)return;const old=$('slide'+(front?'B':'A'));img.classList.add('visible');old.classList.remove('visible');front=1-front;position=n;const groupPhoto=String(item.task||'').trim().toLocaleLowerCase('da-DK')==='gruppebillede';$('groupCaption').textContent=item.team;$('groupCaption').hidden=!groupPhoto;$('teamName').textContent=item.team;$('taskName').textContent=item.task;$('counter').textContent=(n+1)+' / '+slides.length;$('waiting').hidden=true;$('status').textContent=''}catch(e){showError(e)}}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();$('loginStatus').textContent='Logger ind…';try{const d=await req('/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':KEY,'Content-Type':'application/json'},body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})});session={...d,expires_at:Math.floor(Date.now()/1000)+d.expires_in};$('password').value='';await start()}catch(err){$('loginStatus').textContent=err.message}});
$('eventSelect').addEventListener('change',()=>{refreshRanking().catch(showError);slides=[];position=-1;nonce++;$('slideA').classList.remove('visible');$('slideB').classList.remove('visible');$('waiting').hidden=false;$('groupCaption').hidden=true;refresh()});
$('fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});
$('logout').addEventListener('click',()=>{clearInterval(poll);clearInterval(cycle);session=null;location.reload()});

async function refreshRanking(){
 const id=$('eventSelect').value;if(!id)return;
 const teams=await all('hold','id,navn,status,startet_at,afleveret_at','&arrangement_id=eq.'+encodeURIComponent(id));
 const finished=teams.filter(t=>t.status==='afleveret'&&t.afleveret_at);
 const points=new Map(finished.map(t=>[t.id,0]));
 for(let i=0;i<finished.length;i+=75){
  const ids=finished.slice(i,i+75).map(t=>t.id).join(',');
  const answers=await adminReq('/rest/v1/besvarelser?select=id,hold_id&hold_id=in.('+ids+')&limit=10000');
  for(let j=0;j<answers.length;j+=75){
   const batch=answers.slice(j,j+75),judgements=await adminReq('/rest/v1/bedoemmelser?select=besvarelse_id,point&besvarelse_id=in.('+batch.map(a=>a.id).join(',')+')&limit=10000');
   const owner=new Map(batch.map(a=>[a.id,a.hold_id]));
   for(const row of judgements){const team=owner.get(row.besvarelse_id);if(team)points.set(team,(points.get(team)||0)+Number(row.point||0))}
  }
 }
 const elapsed=t=>Math.max(0,Math.floor((new Date(t.afleveret_at)-new Date(t.startet_at))/1000));
 finished.sort((a,b)=>points.get(b.id)-points.get(a.id)||elapsed(a)-elapsed(b)||new Date(a.afleveret_at)-new Date(b.afleveret_at));
 const list=$('rankingList');list.replaceChildren();
 if(!finished.length){const p=document.createElement('p');p.className='rank-empty';p.textContent='Venter på afleverede hold…';list.append(p);return}
 finished.forEach((t,i)=>{const row=document.createElement('div');row.className='rank-item';const place=document.createElement('span');place.className='rank-place';place.textContent=(i+1)+'.';const name=document.createElement('span');name.className='rank-name';name.textContent=t.navn;const pts=document.createElement('span');pts.className='rank-points';pts.textContent=points.get(t.id)+' p';const time=document.createElement('span');time.className='rank-time';const sec=elapsed(t);time.textContent=Math.floor(sec/60)+' min '+sec%60+' sek';row.append(place,name,pts,time);list.append(row)});
}
