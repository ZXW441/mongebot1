const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// DB path
const DB_PATH = path.join(__dirname, 'db.json');

// Initial DB
if(!fs.existsSync(DB_PATH)){
    fs.writeJsonSync(DB_PATH, {users:[], chats:[]}, {spaces:2});
}

// Helpers
function loadDB(){ return fs.readJsonSync(DB_PATH); }
function saveDB(data){ fs.writeJsonSync(DB_PATH, data, {spaces:2}); }

// --- API ROUTES ---

// Signup
app.post('/api/signup', (req,res)=>{
    const {username,password,first,last} = req.body;
    if(!username || !password || !first) return res.json({error:'Champs requis manquants'});
    
    const db = loadDB();
    if(db.users.find(u => u.username.toLowerCase()===username.toLowerCase()))
        return res.json({error:'Nom d\'utilisateur déjà pris'});
    
    db.users.push({username,password,first,last,role:'user',avatar:'',mustChangePassword:false,blocked:false});
    saveDB(db);
    return res.json({success:true,username});
});

// Login
app.post('/api/login',(req,res)=>{
    const {username,password} = req.body;
    if(!username||!password) return res.json({error:'Champs requis manquants'});
    const db = loadDB();
    const user = db.users.find(u=>u.username.toLowerCase()===username.toLowerCase());
    if(!user) return res.json({error:'Utilisateur non trouvé'});
    if(user.password!==password) return res.json({error:'Mot de passe incorrect'});
    res.json({username:user.username,role:user.role});
});

// Get all chats
app.get('/api/chats', (req,res)=>{
    const db = loadDB();
    res.json(db.chats || []);
});

// Add message to chat
app.post('/api/chats/:chatName/messages', (req,res)=>{
    const {chatName} = req.params;
    const {who,text,avatar} = req.body;
    if(!text || !who) return res.json({error:'Message invalide'});
    const db = loadDB();
    let chat = db.chats.find(c=>c.name===chatName);
    if(!chat){
        chat = {name:chatName,messages:[]};
        db.chats.push(chat);
    }
    chat.messages.push({who,text,avatar});
    saveDB(db);
    res.json({success:true});
});

// Serve frontend
app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
