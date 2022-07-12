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
	clientID:'692346196735-al14js8o2luiafqbrgovm3nka806qhtc.apps.googleusercontent.com',
	clientSecret:'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',
	callbackURL:'http://localhost:4000/auth/callback',
	passReqToCallback:true,
},

function(request:any, accessToken:any, refreshToken:any, profile:any, done:any) {
	return done(null, profile);
}
));
