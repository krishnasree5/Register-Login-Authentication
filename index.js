import "dotenv/config";
import bcrypt from "bcrypt";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import pg from "pg";
import { error } from "console";
//import md5 from "md5";
const saltRounds = 10;

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const db = new pg.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

db.connect();
app.get("/",(req, res) => {
    res.render("home.ejs");
});

app.get("/register",(req, res) => {
    res.render("register.ejs");
});

app.post("/register",async (req, res) => {
    const email=req.body.email;
    const password = req.body.password;
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[email]);
        
        if(result.rows[0]){
            console.log("User already exists!");
            res.render("register.ejs");

        }else{
            bcrypt.hash(password, saltRounds, async function(err, hash) {
                await db.query("INSERT INTO users VALUES ($1, $2)",[email, hash]);
                console.log("User registered successfully!");
                res.render("dest.ejs");
            });
            
        }

    }catch(err){
        console.log(error);
    }    
});

app.get("/login",(req, res) => {
    res.render("login.ejs");
});

app.post("/login",async (req, res) => {
    const email=req.body.email;
    const password = req.body.password;
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[email]);

        if(result.rows[0]){
            const user = result.rows[0];
            const hash = user.password;
            bcrypt.compare(password, hash, function(err, result) {
                
                if(result){
                    console.log("Login successful.");
                    res.render("dest.ejs");
                }else{
                    console.log("Incorrect Password");
                    res.render("login.ejs");
                }

            });

        }else{
            console.log("User not found!");
            res.render("login.ejs");
        }

    }catch(err){
        console.log(err);
    }
    
});

app.get("/dest",(req, res) => {
    res.render("dest.ejs");
});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});