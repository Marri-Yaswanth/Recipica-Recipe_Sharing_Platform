import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { query } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5001'}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            const existingUser = await query('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
            
            if (existingUser.length > 0) {
                return done(null, existingUser[0]);
            }
            
            // Create new user
            const result = await query(
                'INSERT INTO users (name, email, password, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?)',
                [profile.displayName, profile.emails[0].value, '', 'google', profile.id]
            );
            
            const newUser = {
                id: result.insertId,
                name: profile.displayName,
                email: profile.emails[0].value
            };
            
            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    }));
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5001'}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
            
            // Check if user exists
            const existingUser = await query('SELECT * FROM users WHERE email = ?', [email]);
            
            if (existingUser.length > 0) {
                return done(null, existingUser[0]);
            }
            
            // Create new user
            const result = await query(
                'INSERT INTO users (name, email, password, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?)',
                [profile.displayName, email, '', 'facebook', profile.id]
            );
            
            const newUser = {
                id: result.insertId,
                name: profile.displayName,
                email: email
            };
            
            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    }));
}

export default passport;
