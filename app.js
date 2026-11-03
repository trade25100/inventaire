'use strict';
const KEY='ma-chambre-inventaire-v1';const $=id=>document.getElementById(id);let data=[];let scanner=null;let qrItem=null;
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');data=Array.isArray(v)?v:[]}catch{data=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){alert('Stockage plein ou inaccessible. Exportez vos données JSON.');throw e}render()}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function validUrl(s){try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function clean(x){return {id:String(x.id||crypto.randomUUID()),name:String(x.name||'').slice(0,200),code:String(x.code||'').slice(0,500),qty:Math.max(0,Math.floor(Number(x.qty)||0)),location:String(x.location||'').slice(0,250),category:String(x.category||'').slice(0,100),image:validUrl(x.image||''),price:x.price===''||x.price==null?'':Math.max(0,Number(x.price)||0),date:String(x.date||'').slice(0,10),notes:String(x.notes||'').slice(0,2000),updated:Number(x.updated)||Date.now()}}
function render(){const q=$('search').value.trim().toLowerCase(),loc=$('filterLocation').value,sort=$('sort').value;const locations=[...new Set(data.map(x=>x.location).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));$('types').textContent=data.length;$('total').textContent=data.reduce((n,x)=>n+x.qty,0);$('places').textContent=locations.length;$('locations').innerHTML=locations.map(x=>`<option value="${safe(x)}">`).join('');$('filterLocation').innerHTML='<option value="">Tous les emplacements</option>'+locations.map(x=>`<option value="${safe(x)}" ${x===loc?'selected':''}>${safe(x)}</option>`).join('');let rows=data.filter(x=>(!loc||x.location===loc)&&[x.name,x.code,x.location,x.category,x.notes].join(' ').toLowerCase().includes(q));rows.sort((a,b)=>sort==='qty'?b.qty-a.qty:sort==='recent'?b.updated-a.updated:String(a[sort]||'').localeCompare(String(b[sort]||''),'fr'));$('items').innerHTML=rows.length?rows.map(x=>`<article class="item">${x.image?`<img src="${safe(x.image)}" alt="Image de ${safe(x.name)}" loading="lazy" referrerpolicy="no-referrer">`:''}<h3>${safe(x.name)}</h3><p>📍 ${safe(x.location)}</p><p>📦 Quantité : <b>${x.qty}</b>${x.category?' · '+safe(x.category):''}</p>${x.code?`<p>Code : <code>${safe(x.code)}</code></p>`:''}${x.price!==''?`<p>Prix unitaire : ${Number(x.price).toFixed(2)} €</p>`:''}${x.date?`<p>Acheté le : ${safe(x.date)}</p>`:''}${x.notes?`<p>${safe(x.notes)}</p>`:''}<div class="actions"><button data-action="edit" data-id="${safe(x.id)}">Modifier</button><button data-action="qr" data-id="${safe(x.id)}" class="secondary">QR</button><button data-action="delete" data-id="${safe(x.id)}" class="secondary">Supprimer</button></div></article>`).join(''):'<p class="empty">Aucun objet trouvé. Ajoutez votre premier objet ci-dessus.</p>'}
$('form').addEventListener('submit',e=>{e.preventDefault();const id=$('id').value||crypto.randomUUID();const item=clean({id,name:$('name').value,code:$('code').value,qty:$('qty').value,location:$('location').value,category:$('category').value,image:$('image').value,price:$('price').value,date:$('date').value,notes:$('notes').value,updated:Date.now()});if(!item.name.trim()||!item.location.trim())return alert('Nom et emplacement obligatoires.');const i=data.findIndex(x=>x.id===id);if(i>=0)data[i]=item;else data.push(item);save();resetForm()});
function resetForm(){$('form').reset();$('id').value='';$('qty').value='1'}$('reset').onclick=resetForm;
$('items').onclick=e=>{const b=e.target.closest('button[data-action]');if(!b)return;const x=data.find(y=>y.id===b.dataset.id);if(!x)return;if(b.dataset.action==='delete'){if(confirm('Supprimer « '+x.name+' » ?')){data=data.filter(y=>y.id!==x.id);save()}}else if(b.dataset.action==='edit'){for(const k of ['id','name','code','qty','location','category','image','price','date','notes'])$(k).value=x[k]??'';window.scrollTo({top:0,behavior:'smooth'})}else showQR(x)};
for(const id of ['search','filterLocation','sort'])$(id).addEventListener(id==='search'?'input':'change',render);
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
$('export').onclick=()=>download('inventaire-chambre.json',JSON.stringify({version:1,exported:new Date().toISOString(),items:data},null,2),'application/json');
$('csv').onclick=()=>{const fields=['name','code','qty','location','category','image','price','date','notes'];const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';download('inventaire-chambre.csv','\ufeff'+[fields.join(';'),...data.map(x=>fields.map(k=>cell(x[k])).join(';'))].join('\r\n'),'text/csv;charset=utf-8')};
$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const obj=JSON.parse(await file.text());const rows=Array.isArray(obj)?obj:obj.items;if(!Array.isArray(rows)||rows.length>100000)throw Error('Format invalide');const items=rows.map(clean).filter(x=>x.name.trim()&&x.location.trim());if(!confirm(`Importer ${items.length} objets ? Cela remplacera votre inventaire actuel.`))return;data=items;save();alert('Import terminé')}catch(err){alert('Import impossible : '+err.message)}finally{e.target.value=''}};
async function stopScan(){if(scanner){try{await scanner.stop()}catch{}try{scanner.clear()}catch{}scanner=null}$('scanner').hidden=true}
$('scan').onclick=async()=>{if(!window.Html5Qrcode)return alert('Bibliothèque de scan indisponible. Vérifiez votre connexion Internet.');await stopScan();$('scanner').hidden=false;scanner=new Html5Qrcode('reader');try{await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:230,height:230}},async text=>{await stopScan();$('code').value=text;const found=data.find(x=>x.code===text);if(found&&confirm('Code connu : '+found.name+'. Modifier sa fiche ?')){for(const k of ['id','name','code','qty','location','category','image','price','date','notes'])$(k).value=found[k]??''}})}catch(e){alert('Caméra indisponible : '+e.message);await stopScan()}};$('stopScan').onclick=stopScan;
function showQR(x){qrItem=x;$('qrTitle').textContent=x.name+' — '+x.location;const url=new URL(location.href);url.searchParams.set('objet',x.id);if(!window.QRCode)return alert('Générateur QR indisponible. Vérifiez votre connexion Internet.');QRCode.toCanvas($('qrCanvas'),url.href,{width:250,margin:2},err=>{if(err)alert('Impossible de générer le QR')});$('qrDialog').showModal()}
$('closeQr').onclick=()=>$('qrDialog').close();$('printQr').onclick=()=>{const canvas=$('qrCanvas');const win=window.open('','_blank');if(!win)return alert('Autorisez les fenêtres pop-up pour imprimer.');const name=safe(qrItem?.name),loc=safe(qrItem?.location);win.document.write('<!doctype html><html><head><title>Étiquette QR</title><style>body{font:16px Arial;text-align:center;padding:25px}img{width:250px}</style></head><body><h2>'+name+'</h2><p>'+loc+'</p><img src="'+canvas.toDataURL('image/png')+'"><p>Ma Chambre</p></body></html>');win.document.close();win.onload=()=>win.print()};

// LENVII / lecteurs USB HID clavier : fonctionne sans WebUSB ni pilote navigateur.
let usbEnabled=false,usbTimer=null,usbLast='',usbCurrent=null,usbHandledAt=0;
const usbInput=$('usbInput');
function usbMessage(message){$('usbStatus').textContent=message}
function usbFocus(){if(usbEnabled && document.activeElement!==usbInput)usbInput.focus()}
// Convertit les frappes de la rangée numérique QWERTY interprétées en AZERTY FR.
// Ne modifie jamais un QR alphanumérique : correction limitée aux chaînes
// entièrement composées de chiffres et des symboles AZERTY correspondants.
const azertyDigits={'&':'1','é':'2','"':'3',"'":'4','(':'5','-':'6','è':'7','_':'8','ç':'9','à':'0'};
function normalizeUsbCode(raw){
 const value=String(raw||'').replace(/[\r\n]+$/g,'').trim();
 if(!$('usbAzerty').checked || !value || !/[&é"'()è_çà]/.test(value))return value;
 if(!/^[0-9&é"'()\-è_çà]+$/.test(value))return value;
 return Array.from(value,c=>azertyDigits[c]??c).join('');
}
function usbLookup(raw){
 const original=String(raw||'').replace(/[\r\n]+$/g,'').trim();
 const code=normalizeUsbCode(original);
 if(!code)return;
 if(code===usbLast && Date.now()-usbHandledAt<900)return;
 usbLast=code;usbHandledAt=Date.now();clearTimeout(usbTimer);
 const item=data.find(x=>x.code===code);usbCurrent=item||null;
 $('usbResult').hidden=false;
 if(item){$('usbInfo').textContent='✓ Trouvé : '+item.name+' — '+item.location+' — Quantité : '+item.qty+' — Code : '+code;$('usbPlus').hidden=false;$('usbEdit').hidden=false;$('usbNew').hidden=true;usbMessage((code!==original?'AZERTY corrigé : '+original+' → '+code+'. ':'')+'Code reconnu. Vous pouvez ajouter 1 unité ou modifier sa fiche.');}
 else{$('usbInfo').textContent='Code inconnu : '+code+'. Créez une fiche pour cet objet.';$('usbPlus').hidden=true;$('usbEdit').hidden=true;$('usbNew').hidden=false;usbMessage((code!==original?'AZERTY corrigé : '+original+' → '+code+'. ':'')+'Nouveau code détecté.');}
 usbInput.value='';
}
$('usbActivate').onclick=()=>{usbEnabled=true;usbFocus();usbMessage('Scan USB activé. Présentez un code au LENVII.');};
$('usbDisable').onclick=()=>{usbEnabled=false;clearTimeout(usbTimer);usbMessage('Scan USB désactivé.');};
$('usbSubmit').onclick=()=>usbLookup(usbInput.value);
usbInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();usbLookup(usbInput.value)}});
usbInput.addEventListener('input',()=>{if(!usbEnabled)return;clearTimeout(usbTimer);usbTimer=setTimeout(()=>usbLookup(usbInput.value),450)});
$('usbPlus').onclick=()=>{if(!usbCurrent)return;const i=data.findIndex(x=>x.id===usbCurrent.id);if(i<0)return;data[i].qty++;data[i].updated=Date.now();usbCurrent=data[i];save();$('usbInfo').textContent='✓ '+usbCurrent.name+' — '+usbCurrent.location+' — Nouvelle quantité : '+usbCurrent.qty;usbMessage('Une unité ajoutée.');usbFocus()};
$('usbEdit').onclick=()=>{if(!usbCurrent)return;for(const k of ['id','name','code','qty','location','category','image','price','date','notes'])$(k).value=usbCurrent[k]??'';usbMessage('Fiche chargée dans le formulaire.');$('form').scrollIntoView({behavior:'smooth',block:'center'})};
$('usbNew').onclick=()=>{const code=usbLast;resetForm();$('code').value=code;usbMessage('Code ajouté au formulaire : complétez le nom et l’emplacement.');$('form').scrollIntoView({behavior:'smooth',block:'center'});$('name').focus()};

load();render();const requested=new URLSearchParams(location.search).get('objet');if(requested){const x=data.find(x=>x.id===requested);if(x){$('search').value=x.name;render()}else setTimeout(()=>alert('Objet non trouvé dans ce navigateur. Importez la sauvegarde JSON correspondante.'),200)}

// Navigation aside et résumé dynamique — sans modifier le stockage existant.
function updateSidebar(){
 $('sideTypes').textContent=data.length;
 $('sideQty').textContent=data.reduce((sum,x)=>sum+x.qty,0);
 $('sideLow').textContent=data.filter(x=>x.qty<=2).length;
 const counts=new Map();data.forEach(x=>{if(x.location)counts.set(x.location,(counts.get(x.location)||0)+x.qty)});
 const container=$('sideLocations');container.replaceChildren();
 const all=document.createElement('button');all.type='button';all.textContent='Tous les emplacements';all.onclick=()=>selectSidebarLocation('');container.append(all);
 [...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0],'fr')).forEach(([loc,n])=>{const b=document.createElement('button');b.type='button';b.textContent=loc+' ('+n+')';b.onclick=()=>selectSidebarLocation(loc);container.append(b)});
}
function selectSidebarLocation(loc){$('filterLocation').value=loc;render();document.getElementById('inventaire').scrollIntoView({behavior:'smooth'});document.body.classList.remove('sidebar-open')}
const previousRender=render;render=function(){previousRender();updateSidebar()};
$('openSidebar').onclick=()=>document.body.classList.add('sidebar-open');
$('closeSidebar').onclick=()=>document.body.classList.remove('sidebar-open');
document.querySelectorAll('.side-nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('sidebar-open')));
$('sideExport').onclick=()=>$('export').click();
updateSidebar();
