const db=require("./database");
const count=db.prepare("SELECT COUNT(*) n FROM skins").get().n;
if(!count){
 const add=db.prepare("INSERT INTO skins(name,image_path,price,is_custom) VALUES(?,?,?,0)");
 add.run("Starter Explorer","",0);
 add.run("Neon Adventurer","",250);
 add.run("Midnight Knight","",400);
 console.log("Demo skin entries created. Add valid PNG assets before publishing them.");
}else console.log("Skin catalog already seeded.");
