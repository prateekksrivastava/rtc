import passport from 'passport';
import {Strategy} from "passport-google-oauth2"
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user , done) => {
	done(null, user);
})

passport.deserializeUser(function(user, done) {
	done(null, user);
});

passport.use(new Strategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	callbackURL: process.env.callbackURL,
	passReqToCallback: true,
},

function(request:any, accessToken:any, refreshToken:any, profile:any, done:any) {
	return done(null, profile);
}
));
