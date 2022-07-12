"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth2_1 = require("passport-google-oauth2");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: '692346196735-al14js8o2luiafqbrgovm3nka806qhtc.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:4000/auth/callback',
    passReqToCallback: true,
}, function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));
