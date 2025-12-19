const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(' Google OAuth Profile:', profile);

        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;

       
        let result = await pool.query(
          'SELECT * FROM users WHERE google_id = $1',
          [googleId]
        );

        if (result.rows.length > 0) {
          console.log(' Existing user found by Google ID:', result.rows[0].email);
          return done(null, result.rows[0]);
        }

        
        result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        if (result.rows.length > 0) {
          const updateResult = await pool.query(
            'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
            [googleId, email]
          );
          console.log(' Linked Google account to existing email:', email);
          return done(null, updateResult.rows[0]);
        }

      
        let baseUsername = email.split('@')[0];
        let username = baseUsername;
        let usernameExists = true;
        let attempts = 0;

        while (usernameExists && attempts < 10) {
          const usernameCheck = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
          );

          if (usernameCheck.rows.length === 0) {
            usernameExists = false;
          } else {
            username = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;
            attempts++;
          }
        }

        if (usernameExists) {
          username = `${baseUsername}_${Date.now()}`;
        }

        console.log('📝 Generated unique username:', username);

        
        const insertResult = await pool.query(
          `INSERT INTO users (google_id, email, name, username, role, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING *`,
          [googleId, email, name, username, 'user']
        );

        const newUser = insertResult.rows[0];
        console.log(' New user created:', newUser.email, 'with username:', newUser.username);
        
        return done(null, newUser);

      } catch (error) {
        console.error(' Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;