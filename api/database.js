const Database = require("better-sqlite3");
const fs = require("fs");
fs.mkdirSync("./data",{recursive:true});
const db = new Database("./data/multiplayer-hub.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,coins INTEGER NOT NULL DEFAULT 100,last_daily INTEGER NOT NULL DEFAULT 0,daily_streak INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS skins(id INTEGER PRIMARY KEY,name TEXT NOT NULL,image_path TEXT NOT NULL,price INTEGER NOT NULL DEFAULT 0,creator_id INTEGER,is_custom INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS inventory(user_id INTEGER NOT NULL,skin_id INTEGER NOT NULL,purchased_at INTEGER NOT NULL,PRIMARY KEY(user_id,skin_id),FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(skin_id) REFERENCES skins(id));
CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,amount INTEGER NOT NULL,reason TEXT NOT NULL,created_at INTEGER NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS api_keys(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,name TEXT NOT NULL,key_hash TEXT UNIQUE NOT NULL,created_at INTEGER NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS rooms(id TEXT PRIMARY KEY,name TEXT NOT NULL,players INTEGER NOT NULL DEFAULT 0,max_players INTEGER NOT NULL DEFAULT 8,minecraft_version TEXT NOT NULL,loader TEXT NOT NULL,site_view INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
`);
module.exports=db;
