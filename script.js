const demoRooms = [
  {name:"Survival World",id:"MC-48291",players:3,max:10,version:"1.20.1",loader:"Forge",icon:"▧"},
  {name:"Creative Friends",id:"MC-72915",players:2,max:8,version:"1.20.1",loader:"Forge",icon:"✦"},
  {name:"Vanilla+ Adventure",id:"MC-11804",players:5,max:12,version:"1.21.1",loader:"NeoForge",icon:"◇"},
  {name:"Redstone Lab",id:"MC-55062",players:1,max:6,version:"1.20.1",loader:"Forge",icon:"⌘"},
  {name:"Sky Islands",id:"MC-90331",players:4,max:16,version:"1.21.1",loader:"Fabric",icon:"☁"},
  {name:"Cozy Village",id:"MC-37428",players:6,max:10,version:"1.21.1",loader:"NeoForge",icon:"⌂"}
];

const grid = document.getElementById("room-grid");
const search = document.getElementById("room-search");
const versionFilter = document.getElementById("version-filter");
const loaderFilter = document.getElementById("loader-filter");
const count = document.getElementById("room-count");
const empty = document.getElementById("empty-state");

function renderRooms(){
  const query = search.value.trim().toLowerCase();
  const version = versionFilter.value;
  const loader = loaderFilter.value;
  const visible = rooms.filter(room =>
    (room.name.toLowerCase().includes(query) || room.id.toLowerCase().includes(query)) &&
    (version === "all" || room.version === version) &&
    (loader === "all" || room.loader === loader)
  );
  grid.innerHTML = visible.map(room => `
    <article class="room-card">
      <div class="room-card-head">
        <span class="room-symbol">${room.icon}</span>
        <span class="room-state"><span class="status-dot"></span> Демонстрация</span>
      </div>
      <h3>${escapeHtml(room.name)}</h3>
      <div class="room-id">ID: ${room.id}</div>
      <div class="room-meta">
        <span class="tag">${room.version}</span>
        <span class="tag loader">${room.loader}</span>
      </div>
      <div class="room-card-foot">
        <span class="players">${room.players}/${room.max} игроков</span>
        <span class="join-button" title="Подключение будет добавлено позже">В игре ↗</span>
      </div>
    </article>
  `).join("");
  count.textContent = `${visible.length} ${pluralRooms(visible.length)}`;
  empty.classList.toggle("hidden", visible.length !== 0);
  grid.classList.toggle("hidden", visible.length === 0);
}
function escapeHtml(text){
  return text.replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[char]));
}
function pluralRooms(n){
  const n10=n%10,n100=n%100;
  if(n10===1&&n100!==11)return "комната";
  if(n10>=2&&n10<=4&&!(n100>=12&&n100<=14))return "комнаты";
  return "комнат";
}
[search,versionFilter,loaderFilter].forEach(el=>el.addEventListener("input",renderRooms));
document.getElementById("reset-filters").addEventListener("click",()=>{
  search.value="";versionFilter.value="all";loaderFilter.value="all";renderRooms();
});
document.addEventListener("keydown",event=>{
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
    event.preventDefault();search.focus();
  }
});
document.getElementById("year").textContent=new Date().getFullYear();
renderRooms();

// Ambient particles (decorative only)
const particleLayer=document.getElementById("particles");
if(particleLayer){
  for(let i=0;i<38;i++){
    const p=document.createElement("span");
    p.className="particle";
    p.style.left=(Math.random()*100)+"%";
    p.style.top=(Math.random()*100)+"%";
    p.style.setProperty("--duration",(12+Math.random()*20)+"s");
    p.style.setProperty("--delay",(-Math.random()*28)+"s");
    p.style.opacity=(.15+Math.random()*.4);
    particleLayer.appendChild(p);
  }
}
// Gentle parallax tilt for cube illustration
const art=document.querySelector(".hero-art");
const cubeScene=document.querySelector(".cube-scene");
if(art&&cubeScene&&window.matchMedia("(prefers-reduced-motion: no-preference)").matches){
  art.addEventListener("mousemove",event=>{
    const rect=art.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    cubeScene.style.transform=`rotate(-25deg) translateY(-5px) rotateX(${(-y*10).toFixed(1)}deg) rotateY(${(x*12).toFixed(1)}deg)`;
  });
  art.addEventListener("mouseleave",()=>cubeScene.style.transform="");
}
// Highlight room cards toward cursor
document.addEventListener("mousemove",event=>{
  const card=event.target.closest?.(".room-card");
  if(!card)return;
  const r=card.getBoundingClientRect();
  card.style.setProperty("--mx",`${event.clientX-r.left}px`);
  card.style.setProperty("--my",`${event.clientY-r.top}px`);
});

// API integration: use live rooms when configured; otherwise demo content.
async function loadRoomsFromApi(){
  const rawApiBase=(window.MULTIPLAYER_HUB_API||"").trim();
  const apiBase=rawApiBase.endsWith("/")?rawApiBase.slice(0,-1):rawApiBase;
  if(!apiBase){renderRooms();return;}
  try{
    const response=await fetch(`${apiBase}/api/v1/rooms`,{headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error(`API HTTP ${response.status}`);
    const payload=await response.json();
    if(!Array.isArray(payload.rooms))throw new Error("Unexpected API response");
    rooms=payload.rooms.map(room=>({
      name:room.name,
      id:room.id,
      players:Number(room.players_online||0),
      max:Number(room.player_limit||0),
      version:room.minecraft_version,
      loader:room.loader,
      icon:room.icon||"◇",
      status:room.status||"online"
    }));
    renderRooms();
  }catch(error){
    console.warn("Multiplayer Hub API unavailable; showing demo rooms.",error);
    rooms=[...demoRooms];
    renderRooms();
  }
}
loadRoomsFromApi();

// Scroll-driven atmosphere: top is greener; deeper sections become cooler/darker.
let scrollTick=false;
function updateScrollAtmosphere(){
  const maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  const progress=Math.min(1,window.scrollY/maxScroll);
  document.documentElement.style.setProperty("--scroll-progress",progress.toFixed(3));
  document.documentElement.style.setProperty("--green-glow-opacity",(0.20*(1-progress)).toFixed(3));
  document.documentElement.style.setProperty("--blue-glow-opacity",(0.05+0.12*progress).toFixed(3));
  document.documentElement.style.setProperty("--page-darkness",(0.04+0.13*progress).toFixed(3));
  scrollTick=false;
}
window.addEventListener("scroll",()=>{
  if(!scrollTick){requestAnimationFrame(updateScrollAtmosphere);scrollTick=true;}
},{passive:true});
updateScrollAtmosphere();
