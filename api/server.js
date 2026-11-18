import express from "express";
import cors from "cors";

const app=express();
const PORT=process.env.PORT||3000;
const WEB_ORIGIN=process.env.WEB_ORIGIN||"*";
app.use(cors({origin:WEB_ORIGIN==="*"?"*":WEB_ORIGIN}));
app.use(express.json({limit:"32kb"}));

const rooms=[
  {id:"MC-48291",name:"Survival World",minecraft_version:"1.20.1",loader:"Forge",players_online:3,player_limit:10,status:"online",icon:"▧"},
  {id:"MC-72915",name:"Creative Friends",minecraft_version:"1.20.1",loader:"Forge",players_online:2,player_limit:8,status:"online",icon:"✦"},
  {id:"MC-11804",name:"Vanilla+ Adventure",minecraft_version:"1.21.1",loader:"NeoForge",players_online:5,player_limit:12,status:"online",icon:"◇"}
];

app.get("/api/v1/health",(req,res)=>res.json({ok:true,service:"multiplayer-hub-api",version:"0.1.0"}));
app.get("/api/v1/rooms",(req,res)=>{
  const {q,version,loader}=req.query;
  let result=rooms.filter(r=>
    (!q||r.name.toLowerCase().includes(String(q).toLowerCase())||r.id.toLowerCase().includes(String(q).toLowerCase()))&&
    (!version||r.minecraft_version===version)&&(!loader||r.loader.toLowerCase()===String(loader).toLowerCase())
  );
  // Public response intentionally contains no password or private host address.
  res.json({rooms:result, count:result.length});
});
app.get("/api/v1/rooms/:id",(req,res)=>{
  const room=rooms.find(r=>r.id===req.params.id);
  if(!room)return res.status(404).json({error:"room_not_found"});
  res.json({room});
});
app.post("/api/v1/rooms",(req,res)=>{
  // Room creation is intentionally not enabled until authentication,
  // ownership checks, validation and persistent storage are implemented.
  res.status(501).json({error:"room_creation_not_implemented",message:"Creation endpoint will be enabled in a later stage."});
});
app.listen(PORT,()=>console.log(`Multiplayer Hub API listening on http://localhost:${PORT}`));
