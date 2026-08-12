const SUPABASE_URL='https://cyeanlchqetiermighft.supabase.co';
const SUPABASE_KEY='sb_publishable_n1EeGd8PA7b2w6f5mQRpSA_HBHLzPZH';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const BASE=window.PADUCAH_BASE||[];
const COLORS={Pending:'#c73a3a',Drafted:'#f08a24','Options Assigned':'#2f8f4e','Option Signed':'#2f7d5a',Closed:'#1f563d',Hold:'#a74747'};
let parcels=BASE.map(p=>({...p,status:'Pending',pricePerAcre:'',currentPosition:'',nextAction:'',notes:'',lastUpdated:''}));
let selected=null,basemap='sat',view={z:16,lon:-88.734,lat:37.116},drag=null;
const $=id=>document.getElementById(id),map=$('map'),tiles=$('tiles'),svg=$('svg');

function fmt(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})}
function setCloud(text,state=''){const el=$('cloud');el.textContent=text;el.className='cloud '+state}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function rowToParcel(base,row){return {...base,owner:row?.owner??base.owner,acres:Number(row?.acres??base.acres),status:row?.status||'Pending',pricePerAcre:row?.price_per_acre??'',currentPosition:row?.current_position??'',nextAction:row?.next_action??'',notes:row?.notes??'',lastUpdated:row?.last_updated??''}}

async function loadCloud(silent=false){
  if(!silent)setCloud('Cloud: syncing','sync');
  const {data,error}=await sb.from('parcels').select('id,owner,acres,status,price_per_acre,current_position,next_action,notes,last_updated');
  if(error){setCloud('Cloud setup required','warn');console.warn(error);refresh();return false}
  const by=new Map((data||[]).map(r=>[r.id,r]));
  parcels=BASE.map(b=>rowToParcel(b,by.get(b.id)));
  setCloud('Cloud: connected','ok');refresh();return true;
}

function world(lon,lat,z){const s=256*2**z,x=(lon+180)/360*s,q=Math.sin(lat*Math.PI/180),y=(.5-Math.log((1+q)/(1-q))/(4*Math.PI))*s;return[x,y]}
function unworld(x,y,z){const s=256*2**z,lon=x/s*360-180,n=Math.PI-2*Math.PI*y/s,lat=180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)));return[lon,lat]}
function centerWorld(){return world(view.lon,view.lat,view.z)}
function screen(lon,lat){const[wx,wy]=world(lon,lat,view.z),[cx,cy]=centerWorld();return[wx-cx+map.clientWidth/2,wy-cy+map.clientHeight/2]}
function tileUrl(z,x,y){const n=2**z;x=((x%n)+n)%n;return basemap==='street'?`https://tile.openstreetmap.org/${z}/${x}/${y}.png`:`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`}
function renderTiles(){tiles.innerHTML='';const[cx,cy]=centerWorld(),w=map.clientWidth,h=map.clientHeight,minX=Math.floor((cx-w/2)/256),maxX=Math.floor((cx+w/2)/256),minY=Math.floor((cy-h/2)/256),maxY=Math.floor((cy+h/2)/256),n=2**view.z;for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){if(y<0||y>=n)continue;const im=document.createElement('img');im.className='tile';im.src=tileUrl(view.z,x,y);im.style.left=x*256-(cx-w/2)+'px';im.style.top=y*256-(cy-h/2)+'px';tiles.appendChild(im)}}
function filtered(){const q=$('search').value.toLowerCase(),s=$('statusFilter').value,o=$('ownerFilter').value;return parcels.filter(p=>(!q||(p.owner+' '+p.currentPosition+' '+p.nextAction+' '+p.notes).toLowerCase().includes(q))&&(!s||p.status===s)&&(!o||p.owner===o))}
function renderVectors(){const ids=new Set(filtered().map(p=>p.id));svg.innerHTML='';for(const p of parcels){if(!ids.has(p.id))continue;const pts=p.coords.map(c=>screen(c[0],c[1])),d=pts.map((a,i)=>(i?'L':'M')+a[0]+','+a[1]).join(' ')+' Z',col=COLORS[p.status]||COLORS.Pending;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.setAttribute('fill',col);path.setAttribute('class','parcel');path.onclick=()=>openParcel(p.id,true);svg.appendChild(path);const out=document.createElementNS('http://www.w3.org/2000/svg','path');out.setAttribute('d',d);out.setAttribute('stroke',col);out.setAttribute('class','outline');svg.appendChild(out)}}
function renderMap(){renderTiles();renderVectors()}
function fitSite(){if(!parcels.length)return;const c=parcels.flatMap(p=>p.coords),a=Math.min(...c.map(x=>x[0])),b=Math.max(...c.map(x=>x[0])),d=Math.min(...c.map(x=>x[1])),e=Math.max(...c.map(x=>x[1]));view.lon=(a+b)/2;view.lat=(d+e)/2;for(let z=20;z>=8;z--){const p1=world(a,e,z),p2=world(b,d,z);if(Math.abs(p2[0]-p1[0])<=map.clientWidth-80&&Math.abs(p2[1]-p1[1])<=map.clientHeight-80){view.z=z;break}}renderMap()}

function refresh(){const owners=[...new Set(parcels.map(p=>p.owner))].sort(),os=$('ownerFilter'),cur=os.value;os.innerHTML='<option value="">All owners</option>'+owners.map(x=>`<option>${esc(x)}</option>`).join('');if(owners.includes(cur))os.value=cur;$('kOwners').textContent=owners.length;$('kParcels').textContent=parcels.length;$('kAcres').innerHTML=fmt(parcels.reduce((s,p)=>s+p.acres,0))+' <span class="unit">ac</span>';$('kSigned').innerHTML=fmt(parcels.filter(p=>['Option Signed','Closed'].includes(p.status)).reduce((s,p)=>s+p.acres,0))+' <span class="unit">ac</span>';const a=filtered();$('shown').textContent=a.length+' shown';$('list').innerHTML=a.map(p=>`<div class="card" data-id="${p.id}" style="border-left-color:${COLORS[p.status]}"><div class="row"><div class="owner">${esc(p.owner)}</div><div class="acres">${fmt(p.acres)} ac</div></div><span class="status">${esc(p.status)}</span></div>`).join('');document.querySelectorAll('.card').forEach(x=>x.onclick=()=>openParcel(x.dataset.id,true));renderVectors()}
function centroid(c){const a=c.slice(0,-1);return[a.reduce((s,x)=>s+x[0],0)/a.length,a.reduce((s,x)=>s+x[1],0)/a.length]}
function setEditable(){['fAcres','fOwner','fStatus','fPrice','fCurrent','fNext','fNotes','fUpdated'].forEach(id=>$(id).disabled=false);$('save').disabled=false;$('save').textContent='Save to Cloud';$('editNote').textContent='Public editing enabled — changes are shared with everyone using this dashboard.'}
function openParcel(id,zoomTo){const p=parcels.find(x=>x.id===id);if(!p)return;selected=id;$('drawerTitle').textContent=p.owner;$('drawerSub').textContent=fmt(p.acres)+' acres';$('fAcres').value=p.acres;$('fOwner').value=p.owner;$('fStatus').value=p.status;$('fPrice').value=p.pricePerAcre;$('fCurrent').value=p.currentPosition;$('fNext').value=p.nextAction;$('fNotes').value=p.notes;$('fUpdated').value=p.lastUpdated;$('drawer').classList.add('open');setEditable();if(zoomTo){const c=centroid(p.coords);view.lon=c[0];view.lat=c[1];view.z=Math.max(view.z,18);renderMap()}}
function closeDrawer(){$('drawer').classList.remove('open');selected=null}

async function saveEdit(){const p=parcels.find(x=>x.id===selected);if(!p)return;const payload={owner:$('fOwner').value.trim(),acres:Number($('fAcres').value||0),status:$('fStatus').value,price_per_acre:$('fPrice').value===''?null:Number($('fPrice').value),current_position:$('fCurrent').value.trim()||null,next_action:$('fNext').value.trim()||null,notes:$('fNotes').value.trim()||null,last_updated:$('fUpdated').value||new Date().toISOString().slice(0,10),updated_at:new Date().toISOString()};$('save').disabled=true;$('save').textContent='Saving…';setCloud('Cloud: saving','sync');const {error}=await sb.from('parcels').update(payload).eq('id',p.id);if(error){setCloud('Cloud save blocked','warn');alert('Cloud save failed: '+error.message+'\n\nRun PUBLIC_EDITING.sql in Supabase SQL Editor to allow public updates.');setEditable();return}await loadCloud(true);closeDrawer();setCloud('Cloud: saved','ok')}

function download(name,content,type){const b=new Blob([content],{type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),300)}
function exportCSV(){const h=['Owner','Acres','Status','Price / Acre','Current Position','Next Action','Notes','Last Updated'],r=parcels.map(p=>[p.owner,p.acres,p.status,p.pricePerAcre,p.currentPosition,p.nextAction,p.notes,p.lastUpdated]);download('Paducah_Land_Tracker.csv',[h,...r].map(x=>x.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv')}

$('legend').innerHTML=Object.entries(COLORS).map(([s,c])=>`<div class="legrow"><span class="sw" style="background:${c}"></span>${s}</div>`).join('');
map.addEventListener('mousedown',e=>{drag={x:e.clientX,y:e.clientY,c:centerWorld()};map.classList.add('drag')});
window.addEventListener('mousemove',e=>{if(!drag)return;const ll=unworld(drag.c[0]-(e.clientX-drag.x),drag.c[1]-(e.clientY-drag.y),view.z);view.lon=ll[0];view.lat=ll[1];renderMap()});
window.addEventListener('mouseup',()=>{drag=null;map.classList.remove('drag')});
map.addEventListener('wheel',e=>{e.preventDefault();view.z=Math.max(8,Math.min(20,view.z+(e.deltaY<0?1:-1)));renderMap()},{passive:false});
$('fit').onclick=fitSite;$('fit2').onclick=fitSite;$('zin').onclick=()=>{view.z=Math.min(20,view.z+1);renderMap()};$('zout').onclick=()=>{view.z=Math.max(8,view.z-1);renderMap()};
$('base').onclick=()=>{basemap=basemap==='sat'?'street':'sat';$('base').textContent=basemap==='sat'?'Street Map':'Satellite';renderTiles()};
$('search').oninput=refresh;$('statusFilter').onchange=refresh;$('ownerFilter').onchange=refresh;$('close').onclick=closeDrawer;$('cancel').onclick=closeDrawer;$('save').onclick=saveEdit;$('csv').onclick=exportCSV;$('json').onclick=()=>download('Paducah_Land_Tracker_Backup.json',JSON.stringify(parcels,null,2),'application/json');$('refreshCloud').onclick=()=>loadCloud();window.addEventListener('resize',renderMap);

// Convert the existing authenticated UI into public editing mode.
const authBtn=$('authBtn');if(authBtn)authBtn.style.display='none';
const sub=document.querySelector('.sub');if(sub)sub.textContent='Shared cloud tracker · public editing';
setEditable();refresh();loadCloud().then(()=>setTimeout(fitSite,80));setInterval(()=>loadCloud(true),15000);
