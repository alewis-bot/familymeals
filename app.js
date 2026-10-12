const D=window.MEAL_DATA, KEY='meals:'+D.title, S=JSON.parse(localStorage.getItem(KEY)||'{}');
const save=()=>localStorage.setItem(KEY,JSON.stringify(S)); const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('wk').textContent=D.title;
const tabs=[['week','This Week'],['recipes','Recipes'],['grocery','Grocery List'],['status','Status'],['staples','Pantry staples']];
function show(t){tabs.forEach(([id])=>{$('tab-'+id).classList.toggle('on',id===t);document.querySelector(`[data-t=${id}]`).classList.toggle('on',id===t)});history.replaceState(null,'','#'+t);scrollTo(0,0)}
$('nav').innerHTML=tabs.map(([id,l])=>`<button data-t="${id}">${l}</button>`).join('');
$('nav').onclick=e=>{if(e.target.dataset.t)show(e.target.dataset.t)};
// week
S.mode=S.mode||{};const modes=['Normal','Busy','Away','Guests'];
$('tab-week').innerHTML=D.week.map((w,i)=>`<div class="card"><div class="mut">${esc(w.day)}</div><h3>${esc(w.meal)}</h3><div class="mut">${esc(w.appliances)}</div>
<div class="seg" data-i="${i}">${modes.map(m=>`<button class="${(S.mode[i]||'Normal')===m?'on':''}">${m}</button>`).join('')}</div></div>`).join('')
+`<div class="card"><details><summary>Household &amp; assumptions</summary>${D.introHtml}</details></div><div class="card"><details><summary>Do these on pickup day</summary>${D.pickupHtml}</details></div>`;
$('tab-week').onclick=e=>{const s=e.target.closest('.seg');if(!s||e.target.tagName!=='BUTTON')return;S.mode[s.dataset.i]=e.target.textContent;save();[...s.children].forEach(b=>b.classList.toggle('on',b===e.target))};
// recipes
$('tab-recipes').innerHTML=D.recipes.map(r=>`<div class="card" id="${r.id}"><h3>${esc(r.title)}</h3><div class="mut">${esc(r.when)}</div>${r.html}</div>`).join('')
+(D.eggCheckHtml?`<div class="card"><h3>Egg Re-check</h3>${D.eggCheckHtml}</div>`:'');
// grocery
S.g=S.g||{};
$('tab-grocery').innerHTML=`<div class="card">${D.groceryIntroHtml}<button id="gclr">Clear all checks</button></div>`+D.grocery.map((g,gi)=>`<div class="card"><h3>${esc(g.section)}</h3>${g.items.map((it,ii)=>{const k=gi+'-'+ii;return `<label class="gi ${S.g[k]?'done':''}"><input type="checkbox" data-k="${k}" ${S.g[k]?'checked':''}><span>${esc(it.text)}${it.checkLabel?'<span class="badge">CHECK LABEL</span>':''}</span></label>`}).join('')}${g.notes.length?`<p class="mut">${g.notes.join('<br>')}</p>`:''}</div>`).join('')
+D.groceryNotes.map(n=>`<div class="card"><h3>${esc(n.section)}</h3>${n.html.replace(/<strong>CHECK LABEL<\/strong>/g,'<span class="badge">CHECK LABEL</span>')}</div>`).join('');
$('tab-grocery').onchange=e=>{const k=e.target.dataset.k;if(!k)return;S.g[k]=e.target.checked;save();e.target.parentNode.classList.toggle('done',e.target.checked)};
$('gclr').onclick=()=>{if(confirm('Uncheck everything?')){S.g={};save();location.reload()}};
// status
S.st=S.st||{};S.r=S.r||{};const states=['Order placed','Picked up','Delivered'];
const dinners=D.week.filter(w=>!/^Open/.test(w.meal));
function renderStatus(){$('tab-status').innerHTML=`<div class="card"><h3>Grocery order</h3>${states.map(s=>`<button class="big ${S.st[s]?'on':''}" data-s="${s}" style="${s==='Picked up'?'font-size:28px;padding:26px':''}">${S.st[s]?'✓ ':''}${s}</button>`).join('')}${Object.keys(S.st).filter(k=>S.st[k]).map(k=>`<div class="mut">${k}: ${S.st[k]}</div>`).join('')}</div>`
+dinners.map(w=>{const r=S.r[w.day]||{};return `<div class="card"><div class="mut">${esc(w.day)}</div><h3>${esc(w.meal)}</h3><div class="rate" data-d="${esc(w.day)}"><button data-v="up" class="${r.v==='up'?'on':''}">👍</button><button data-v="down" class="${r.v==='down'?'on':''}">👎</button><button data-v="again" class="${r.again?'on':''}">🔁 Make again</button></div></div>`}).join('')}
renderStatus();
$('tab-status').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.s){const s=b.dataset.s;S.st[s]=S.st[s]?null:new Date().toLocaleString();}
 else{const d=b.parentNode.dataset.d,r=S.r[d]=S.r[d]||{};if(b.dataset.v==='again')r.again=!r.again;else r.v=r.v===b.dataset.v?null:b.dataset.v}
 save();renderStatus()};
// staples
$('tab-staples').innerHTML=`<div class="card"><h3>Pantry staples</h3><p class="mut">Always on hand — left off the grocery list.</p>${D.staples.map(s=>`<span class="staple">${s}</span>`).join('')}</div>`;
setTimeout(()=>scrollTo(0,0));show((location.hash.slice(1)&&tabs.some(t=>t[0]===location.hash.slice(1)))?location.hash.slice(1):'week');
