POSTGRES QUERY TO CREATE TABLE: <br/><br/>

CREATE TABLE users( <br/>
	id SERIAL PRIMARY KEY, <br/>
	email TEXT UNIQUE NOT NULL, <br/>
	password TEXT NOT NULL <br/>
);<br/><br/>

Level 1: verifying email and password from database.<br/>
Level 2: environment variables.<br/>
Level 3: Hashing passwords (using md5).<br/>
Level 4: Salting and Hashing passwords (using bcrypt).<br/>
Level 5: Sessions and Cookies (using express-session, passport, passport-local). <br/>