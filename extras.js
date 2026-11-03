'use strict';
/* Extensions non destructives : conserve la clé localStorage et les anciennes fiches. */
const HISTORY_KEY='ma-chambre-history-v2', ZONES_KEY='ma-chambre-zones-v2';
const getJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
let movements=getJSON(HISTORY_KEY,[]), zones=getJSON(ZONES_KEY,['Armoire','Bureau','Étagère','Lit','Tiroir']);
if(!Array.isArray(movements))movements=[];if(!Array.isArray(zones))zones=[];
const textOnly=s=>String(s??'').trim();
const extraClean=clean;
clean=function(x){const item=extraClean(x);item.threshold=Math.max(0,Math.floor(Number(x.threshold??2)||0));item.photos=(Array.isArray(x.photos)?x.photos:String(x.photos||'').split(/\r?\n/)).map(validUrl).filter(Boolean).slice(0,12);return item};
data=data.map(clean);
function logMovement(type,item,detail){movements.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),type,name:item?.name||'',code:item?.code||'',detail:String(detail||'')});movements=movements.slice(0,600);localStorage.setItem(HISTORY_KEY,JSON.stringify(movements));drawExtras()}
function fillExtras(item){$('threshold').value=item?.threshold??2;$('photos').value=(item?.photos||[]).join('\n')}
function clearExtras(){fillExtras(null)}
const oldSave=save;
save=function(){oldSave();drawExtras()};
const oldRender=render;
render=function(){oldRender();decorateCards();drawExtras()};
const oldFormSubmit=$('form').onsubmit;
// Capture before legacy submit handler; legacy listener reads fields and saves synchronously.
$('form').addEventListener('submit',()=>{
 const id=$('id').value;const before=data.find(x=>x.id===id);const qty=Number($('qty').value)||0;
 const extra={threshold:Math.max(0,Math.floor(Number($('threshold').value)||0)),photos:$('photos').value.split(/\r?\n/).map(validUrl).filter(Boolean).slice(0,12)};
 // Apply after the original listener (registered earlier) via a microtask.
 queueMicrotask(()=>{const item=data.find(x=>x.id===(id||data.at(-1)?.id));if(!item)return;Object.assign(item,extra);save();logMovement(before?'Modification':'Création',item,before?`Quantité ${before.qty} → ${qty}`:`Quantité initiale : ${qty}`);clearExtras()});
});
$('reset').addEventListener('click',clearExtras);
$('items').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const item=data.find(x=>x.id===b.dataset.id);if(!item)return;
 if(b.dataset.action==='edit'){fillExtras(item)}
 if(b.dataset.action==='delete') {const snapshot={...item};queueMicrotask(()=>{if(!data.some(x=>x.id===snapshot.id))logMovement('Suppression',snapshot,'Fiche supprimée')})}
 if(b.dataset.action==='minus'){if(item.qty<1)return;item.qty--;item.updated=Date.now();save();logMovement('Sortie',item,'−1 unité')}
 if(b.dataset.action==='plus'){item.qty++;item.updated=Date.now();save();logMovement('Entrée',item,'+1 unité')}
});
$('usbPlus').addEventListener('click',()=>{if(usbCurrent)logMovement('Scan LENVII',usbCurrent,'+1 unité')});
$('usbSubmit').addEventListener('click',()=>{if(usbLast)logMovement('Lecture LENVII',data.find(x=>x.code===usbLast)||{code:usbLast},'Code lu')});
function decorateCards(){document.querySelectorAll('#items .item').forEach(card=>{const b=card.querySelector('button[data-id]');if(!b)return;const item=data.find(x=>x.id===b.dataset.id);if(!item)return;
 const actions=card.querySelector('.actions');if(actions&&!actions.querySelector('[data-action="plus"]')){const plus=document.createElement('button');plus.type='button';plus.className='secondary';plus.dataset.action='plus';plus.dataset.id=item.id;plus.textContent='+1';const minus=plus.cloneNode(true);minus.dataset.action='minus';minus.textContent='−1';actions.prepend(minus,plus)}
 const pictures=[item.image,...(item.photos||[])].filter(Boolean);if(pictures.length>1){const gallery=document.createElement('div');gallery.className='photo-gallery';pictures.forEach(url=>{const img=document.createElement('img');img.src=url;img.loading='lazy';img.referrerPolicy='no-referrer';img.alt='Photo de '+item.name;gallery.append(img)});card.insertBefore(gallery,card.querySelector('h3'))}
 if(item.qty<=item.threshold){const flag=document.createElement('span');flag.className='stock-flag';flag.textContent='⚠ Stock faible';card.querySelector('h3')?.after(flag)}
})}
function drawExtras(){if(!$('roomPlan'))return;
 const roots=new Set(zones);data.forEach(x=>roots.add(x.location.split(/\s*(?:>|→|\/)\s*/)[0].trim()));const plan=$('roomPlan');plan.replaceChildren();[...roots].filter(Boolean).sort((a,b)=>a.localeCompare(b,'fr')).forEach(zone=>{const matching=data.filter(x=>x.location.toLocaleLowerCase('fr').startsWith(zone.toLocaleLowerCase('fr')));const b=document.createElement('button');b.type='button';b.className='zone';const label=document.createElement('strong');label.textContent='📍 '+zone;const count=document.createElement('span');count.textContent=matching.length+' fiches · '+matching.reduce((n,x)=>n+x.qty,0)+' unités';b.append(label,count);b.onclick=()=>{$('search').value=zone;$('filterLocation').value='';render();$('inventaire').scrollIntoView({behavior:'smooth'})};plan.append(b)});
 const low=data.filter(x=>x.qty<=x.threshold);$('lowStock').replaceChildren();if(!low.length){$('lowStock').textContent='Aucune alerte pour le moment.'}else low.forEach(x=>{const p=document.createElement('p');p.textContent=`⚠ ${x.name} — ${x.qty} en stock (seuil : ${x.threshold}) — ${x.location}`;$('lowStock').append(p)});
 $('historyList').replaceChildren();if(!movements.length)$('historyList').textContent='Aucun mouvement enregistré pour le moment.';movements.slice(0,100).forEach(m=>{const p=document.createElement('div');p.className='history-row';p.textContent=`${new Date(m.at).toLocaleString('fr-FR')} · ${m.type} · ${m.name||m.code} · ${m.detail}`;$('historyList').append(p)});
}
$('addZone').onclick=()=>{const name=prompt('Nom de la zone (ex. Placard, Bureau, Armoire) :');if(!name?.trim())return;zones=[...new Set([...zones,name.trim().slice(0,80)])];localStorage.setItem(ZONES_KEY,JSON.stringify(zones));drawExtras()};
$('clearHistory').onclick=()=>{if(confirm('Effacer définitivement l’historique des mouvements ?')){movements=[];localStorage.setItem(HISTORY_KEY,'[]');drawExtras()}};
// Recherche optionnelle dans Open Food Facts : données contributives, principalement alimentaires.
$('productLookup').onclick=async()=>{const code=normalizeUsbCode($('code').value.trim());const status=$('lookupStatus');if(!/^\d{8,14}$/.test(code)){status.textContent='Saisissez un EAN/UPC numérique (8 à 14 chiffres).';return}status.textContent='Recherche en cours…';$('productLookup').disabled=true;try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);let res;try{res=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json',{signal:controller.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timer)}if(!res.ok)throw Error('Service indisponible');const obj=await res.json();if(obj.status!==1||!obj.product){status.textContent='Produit non trouvé : saisie manuelle possible.';return}const product=obj.product;if(!$('name').value.trim())$('name').value=product.product_name_fr||product.product_name||'';if(!$('image').value.trim())$('image').value=product.image_front_url||product.image_url||'';if(!$('category').value.trim())$('category').value='Alimentation';status.textContent='Produit trouvé (Open Food Facts). Vérifiez les informations.'}catch(e){status.textContent='Recherche impossible (connexion, CORS ou service). Saisie manuelle disponible.'}finally{$('productLookup').disabled=false}};
// Export JSON enrichi, rétrocompatible : les anciennes sauvegardes restent importables.
$('export').onclick=()=>download('ma-chambre-sauvegarde.json',JSON.stringify({version:2,exported:new Date().toISOString(),items:data,history:movements,zones},null,2),'application/json');
$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const obj=JSON.parse(await file.text());const rows=Array.isArray(obj)?obj:obj.items;if(!Array.isArray(rows)||rows.length>100000)throw Error('Format invalide');const items=rows.map(clean).filter(x=>x.name.trim()&&x.location.trim());if(!confirm(`Remplacer l’inventaire par ${items.length} objets ? Faites une sauvegarde avant.`))return;data=items;movements=Array.isArray(obj.history)?obj.history.slice(0,600):[];zones=Array.isArray(obj.zones)?obj.zones.filter(x=>typeof x==='string').slice(0,100):zones;localStorage.setItem(HISTORY_KEY,JSON.stringify(movements));localStorage.setItem(ZONES_KEY,JSON.stringify(zones));save();alert('Import terminé')}catch(err){alert('Import impossible : '+err.message)}finally{e.target.value=''}};
$('csv').onclick=()=>{const fields=['name','code','qty','threshold','location','category','image','photos','price','date','notes'];const cell=v=>'"'+String(Array.isArray(v)?v.join(' | '):v??'').replace(/"/g,'""')+'"';download('inventaire-chambre.csv','\ufeff'+[fields.join(';'),...data.map(x=>fields.map(k=>cell(x[k])).join(';'))].join('\r\n'),'text/csv;charset=utf-8')};
$('printAll').onclick=async()=>{if(!window.QRCode)return alert('Bibliothèque QR indisponible : vérifiez Internet.');if(!data.length)return alert('Ajoutez d’abord un objet.');const cards=[];for(const x of data){const link=new URL(location.href);link.searchParams.set('objet',x.id);try{const png=await QRCode.toDataURL(link.href,{width:190,margin:1});cards.push(`<div class="label"><b>${safe(x.name)}</b><p>${safe(x.location)}</p><img src="${png}" alt="QR"><small>${safe(x.code)}</small></div>`)}catch{}}const win=window.open('','_blank');if(!win)return alert('Autorisez les pop-ups pour imprimer.');win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Étiquettes Ma Chambre</title><style>body{font-family:Arial}.sheet{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.label{border:1px dashed #555;padding:12px;text-align:center;break-inside:avoid;overflow-wrap:anywhere}.label img{width:130px;display:block;margin:auto}.label p{font-size:12px}.label small{display:block}@media print{button{display:none}}</style></head><body><button onclick="print()">Imprimer</button><div class="sheet">${cards.join('')}</div></body></html>`);win.document.close()};
// Corrige les anciennes fiches dépourvues de nouveaux champs et conserve les données.
render();
