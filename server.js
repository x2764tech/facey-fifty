const express = require('express');
const passport = require('passport');
const passportOAuth2 = require('passport-oauth2');
const refresh = require('passport-oauth2-refresh');
const next = require('next');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

const stravaStrategy = new passportOAuth2({
        authorizationURL: 'https://www.strava.com/oauth/authorize',
        tokenURL: 'https://www.strava.com/oauth/token',
        clientID: process.env.STRAVA_CLIENT_ID,
        clientSecret: process.env.STRAVA_CLIENT_SECRET,
        callbackURL: "/strava/callback",
        passReqToCallback: false
    },
    function (accessToken, refreshToken, profile, extra, done) {
        done(null, {...profile.athlete, token_expires: profile.expires_at, accessToken, refreshToken})
    });
passport.use('strava', stravaStrategy);
refresh.use('strava', stravaStrategy);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

function authenticationMiddleware() {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/strava/')
    }
}

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

const server = express();

server.use(express.static('public'));
server.use(bodyParser.urlencoded({extended: false}));
server.use(expressSession({secret: 'keyboard cat', resave: true, saveUninitialized: false}));
server.use(passport.initialize({}));
server.use(passport.session({}));
//server.use(app.router);

server.get('/strava/', passport.authenticate('strava', {successRedirect: '/'}));
server.get('/strava/callback', passport.authenticate('strava', {successRedirect: '/'}));
server.all('*', authenticationMiddleware(), handle);

app.prepare()
    .then(() => {
        server.listen(port, err => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`)
        })
    })
    .finally(() => {

    });



