'use strict';
/* Navigation par vues : inventaire par défaut, formulaire sur page séparée.
   Ne change aucune clé localStorage ni le format des fiches. */
(()=>{
 const pages=['inventaire','edition','scanner-usb','dashboard','plan','alertes','historique','etiquettes'];
 const $id=id=>document.getElementById(id);
 const main=document.querySelector('#appLayout main');
 const title=document.createElement('div');title.className='view-header';title.innerHTML='<div><span class="eyebrow">MA CHAMBRE</span><h2 id="viewTitle">Mon inventaire</h2></div><button id="quickAdd" type="button">＋ Ajouter un objet</button>';
 main.prepend(title);
 const titles={'inventaire':'Mon inventaire','edition':'Ajouter / modifier un objet','scanner-usb':'Scanner LENVII','dashboard':'Tableau de bord','plan':'Plan de chambre','alertes':'Alertes de stock','historique':'Historique des scans','etiquettes':'Étiquettes QR'};
 function show(page,replace=false){
   if(!pages.includes(page))page='inventaire';
   document.querySelectorAll('#appLayout main > section').forEach(section=>{section.hidden=section.id!==page});
   $id('viewTitle').textContent=titles[page];
   $id('quickAdd').hidden=page==='edition';
   document.querySelectorAll('.side-nav a').forEach(a=>{const active=a.getAttribute('href')==='#'+page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
   document.body.classList.remove('sidebar-open');
   if(location.hash!=='#'+page){if(replace)history.replaceState(null,'','#'+page);else history.pushState(null,'','#'+page)}
   window.scrollTo({top:0,behavior:'instant'});
 }
 window.goToInventory=()=>show('inventaire');
 window.goToEditor=()=>show('edition');
 $id('quickAdd').onclick=()=>{$id('reset').click();show('edition');$id('name').focus()};
 document.querySelectorAll('.side-nav a').forEach(a=>a.addEventListener('click',e=>{const page=a.hash.slice(1);if(pages.includes(page)){e.preventDefault();if(page==='edition'){$id('reset').click()}show(page)}}));
 window.addEventListener('popstate',()=>show(location.hash.slice(1),true));
 window.addEventListener('hashchange',()=>show(location.hash.slice(1),true));
 // Navigation après validation réussie : les données additionnelles sont d'abord sauvées par extras.js.
 $id('form').addEventListener('submit',e=>{
   if(e.defaultPrevented && !$id('name').value.trim())return;
   queueMicrotask(()=>{
     $id('search').value='';$id('filterLocation').value='';
     render();show('inventaire');
     const msg=$id('saveNotice');msg.hidden=false;msg.textContent='✓ Objet enregistré. Retrouvez-le dans votre inventaire.';
     clearTimeout(window.__noticeTimer);window.__noticeTimer=setTimeout(()=>msg.hidden=true,5500);
   });
 });
 // Édition depuis une fiche ou le résultat d'un scan.
 $id('items').addEventListener('click',e=>{if(e.target.closest('[data-action="edit"]'))show('edition')});
 $id('usbEdit').addEventListener('click',()=>show('edition'));
 $id('usbNew').addEventListener('click',()=>show('edition'));
 $id('scan').addEventListener('click',()=>show('edition'));
 // Les zones / emplacements filtrent l'inventaire et changent de vue.
 $id('sideLocations').addEventListener('click',()=>show('inventaire'));
 $id('roomPlan').addEventListener('click',e=>{if(e.target.closest('.zone'))show('inventaire')});
 // Le QR d'une fiche ouvre l'inventaire directement.
 const target=new URLSearchParams(location.search).get('objet');
 if(target && data.some(x=>x.id===target))show('inventaire',true);
 else show(pages.includes(location.hash.slice(1))?location.hash.slice(1):'inventaire',true);
})();
