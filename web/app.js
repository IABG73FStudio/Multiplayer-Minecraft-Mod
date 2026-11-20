const API = (window.MH_CONFIG?.API_BASE || "").replace(/\/$/, "");
const token = () => localStorage.getItem("mh_token");
const headers = () => ({ "Authorization": `Bearer ${token()}` });
async function api(path, options={}) {
  const res = await fetch(API + path, {...options, headers:{...(options.headers||{}), ...(token()?headers():{})}});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
function formObject(form){return Object.fromEntries(new FormData(form).entries())}
function setStatus(id,msg){const el=document.getElementById(id);if(el)el.textContent=msg}
async function refreshProfile(){
  if(!token()) return;
  try { const u=await api("/api/me"); document.querySelectorAll("#balance").forEach(e=>e.textContent=`${u.coins} MC`); const b=document.getElementById("coin-balance");if(b)b.textContent=`${u.coins} MC`; } catch{}
}
async function loadRooms(){
 const box=document.getElementById("rooms-list"); if(!box)return;
 try{const rooms=await api("/api/rooms"); const render=(items)=>{box.innerHTML=items.length?items.map(r=>`<article class="panel room-card"><div class="eyebrow">PUBLIC ROOM</div><h3>${escapeHtml(r.name)}</h3><div class="room-meta">ID: ${escapeHtml(String(r.id))} · ${Number(r.players||0)}/${Number(r.maxPlayers||0)} игроков · ${escapeHtml(r.minecraftVersion||"—")} · ${escapeHtml(r.loader||"—")}</div></article>`).join(""):'<div class="panel">Публичных комнат пока нет.</div>'};render(rooms);document.getElementById("room-search")?.addEventListener("input",e=>render(rooms.filter(r=>(r.name+" "+r.id).toLowerCase().includes(e.target.value.toLowerCase()))));}catch{box.innerHTML='<div class="panel">API комнат пока недоступен. Запусти сервер API.</div>'}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
document.getElementById("register-form")?.addEventListener("submit",async e=>{e.preventDefault();try{const d=await api("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formObject(e.target))});localStorage.setItem("mh_token",d.token);setStatus("auth-status","Аккаунт создан!");refreshProfile()}catch(err){setStatus("auth-status",err.message)}});
document.getElementById("login-form")?.addEventListener("submit",async e=>{e.preventDefault();try{const d=await api("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formObject(e.target))});localStorage.setItem("mh_token",d.token);setStatus("auth-status","Вход выполнен!");refreshProfile()}catch(err){setStatus("auth-status",err.message)}});
document.getElementById("logout")?.addEventListener("click",()=>{localStorage.removeItem("mh_token");location.reload()});
document.getElementById("daily-claim")?.addEventListener("click",async()=>{try{const d=await api("/api/coins/daily",{method:"POST"});setStatus("daily-status",`Получено ${d.reward} MC! Серия: ${d.streak}. Баланс: ${d.balance} MC.`);refreshProfile();loadHistory()}catch(e){setStatus("daily-status",e.message)}});
async function loadHistory(){const el=document.getElementById("transactions");if(!el)return;try{const rows=await api("/api/coins/history");el.innerHTML=rows.length?rows.map(x=>`<p>${escapeHtml(x.reason)} — <b>${x.amount>0?"+":""}${x.amount} MC</b></p>`).join(""):"Операций пока нет."}catch{el.textContent="Войдите в аккаунт."}}
document.getElementById("skin-form")?.addEventListener("submit",async e=>{e.preventDefault();try{const fd=new FormData(e.target);const d=await api("/api/skins/upload",{method:"POST",body:fd});setStatus("skin-status",`Скин загружен! ID: ${d.skinId}. Списано 500 MC.`);e.target.reset();refreshProfile();loadInventory()}catch(err){setStatus("skin-status",err.message)}});
async function loadInventory(){const el=document.getElementById("inventory");if(!el)return;try{const rows=await api("/api/skins/inventory");el.innerHTML=rows.length?rows.map(s=>`<div class="skin-card"><img src="${API}/uploads/skins/${encodeURIComponent(s.image_path)}"><b>${escapeHtml(s.name)}</b></div>`).join(""):"Гардероб пуст."}catch{el.textContent="Войдите в аккаунт, чтобы увидеть гардероб."}}
async function loadShop(){const el=document.getElementById("skin-shop");if(!el)return;try{const rows=await api("/api/skins");el.innerHTML=rows.length?rows.map(s=>`<div class="skin-card"><b>${escapeHtml(s.name)}</b><p>${s.price} MC</p><button class="btn primary" data-buy="${s.id}">Купить</button></div>`).join(""):"Магазин пока пуст."}catch{el.textContent="Каталог пока недоступен."}}
document.getElementById("skin-shop")?.addEventListener("click",async e=>{const id=e.target.dataset.buy;if(!id)return;try{await api(`/api/skins/${id}/buy`,{method:"POST"});setStatus("skin-status","Покупка успешна!");refreshProfile();loadInventory()}catch(err){setStatus("skin-status",err.message)}});
document.getElementById("key-form")?.addEventListener("submit",async e=>{e.preventDefault();try{const d=await api("/api/keys",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formObject(e.target))});setStatus("key-once",`Новый ключ (сохраните сейчас — повторно его показать нельзя): ${d.key}`);loadKeys()}catch(err){setStatus("key-once",err.message)}});
async function loadKeys(){const el=document.getElementById("keys-list");if(!el)return;try{const rows=await api("/api/keys");el.innerHTML=rows.map(k=>`<p>${escapeHtml(k.name)} · создан ${new Date(k.created_at*1000).toLocaleString()} <button class="btn ghost" data-revoke="${k.id}">Отозвать</button></p>`).join("")||"Нет активных ключей."}catch{el.textContent="Войдите в аккаунт."}}
document.getElementById("keys-list")?.addEventListener("click",async e=>{const id=e.target.dataset.revoke;if(!id)return;try{await api(`/api/keys/${id}`,{method:"DELETE"});loadKeys()}catch(err){setStatus("key-once",err.message)}});
window.addEventListener("scroll",()=>{const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?scrollY/max:0;document.documentElement.style.setProperty("--shade",Math.min(.58,progress*.72).toFixed(3))},{passive:true});
refreshProfile();loadRooms();loadHistory();loadInventory();loadShop();loadKeys();
