import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import localPassport from "passport-local";
import session from "express-session";
//import md5 from "md5";
const saltRounds = 10;
 
const port = 3000;
const app = express();
const db = new pg.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});
db.connect();
const localStrategy = localPassport.Strategy;
 
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
 
passport.use("local-register",new localStrategy(async (username,password,done)=>{
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[username]);
        const user = result.rows[0];
        if(user!==undefined){
            return done(null, false);
        }
        else{
            const hashedPass = await bcrypt.hash(password, saltRounds);
            await db.query("INSERT INTO users (email, password) VALUES ($1,$2)",[username,hashedPass]);
            const newResult = await db.query("SELECT * FROM users WHERE email = $1",[username]);
            const newUser = newResult.rows[0];
            return done(null, newUser);
        }
    }
    catch(error){
        return done(error, false);   
    }
}));
passport.use("local-login",new localStrategy(async (username,password,done)=>{
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[username]);
        const user = result.rows[0];
        if(user!==undefined){
            const passCheck = await bcrypt.compare(password, user.password);
            if(passCheck){
                return done(null, user);
            }
            else{
                return done(null, false);
            }
        }
        else{
            return done(null, false);
        }
    }
    catch(error){
        return done(error,false);
    }   
}));
 
passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser(async (id,done)=>{
    try{
        const response = await db.query("SELECT * FROM users WHERE id = $1",[id]);
        const user = response.rows[0];
        done(null,user);
    }
    catch (error){
        done(error,false);
    }
});
 
app.get("/",async (req,res)=>{
    res.render("home.ejs");
});
 
app.get("/register",(req,res)=>{
    res.render("register.ejs");
});
app.post("/register", passport.authenticate("local-register",{
    failureRedirect: "/register",
    successRedirect: "/dest",
}));
 
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});
app.post("/login", passport.authenticate("local-login",{
    failureRedirect: "/login",
    successRedirect: "/dest",
}));
 
app.get("/dest",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("dest.ejs");
    }
    else{
        res.redirect("/register");
    }
});
 
app.get("/logout",(req,res)=>{
    res.clearCookie("connect.sid");    //this will clear the cookies left on client-side
    req.logOut(()=>{
        res.redirect("/");
    });
});
 
app.listen(port,()=>{
    console.log(`The server is running on port ${port}`);
});