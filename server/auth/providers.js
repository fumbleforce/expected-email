const facebookStrategy = require("passport-facebook").Strategy;
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const twitterStrategy = require("passport-twitter").Strategy;


function getFacebookConfig () {
  return {
    provider: "facebook",
    Strategy: facebookStrategy,
    strategyOptions: {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    },
    scope: ["email", "user_location"],
    getUserFromProfile (profile) {
      return {
        _id: profile.id,
        name: profile.displayName,
        email: profile._json.email
      };
    }
  };
}

function getGoogleConfig () {
  return {
    provider: "google",
    Strategy: googleStrategy,
    strategyOptions: {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    },
    scope: "profile email",
    getUserFromProfile (profile) {
      return {
        _id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      };
    }
  };
}

function getTwitterConfig () {
  return {
    provider: "twitter",
    Strategy: twitterStrategy,
    strategyOptions: {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET
    },
    scope: null,
    getUserFromProfile (profile) {
      return {
        _id: profile.id,
        name: profile.displayName,
        email: `${profile.username}@twitter`
      };
    }
  };
}

module.exports = {
  getFacebookConfig,
  getGoogleConfig,
  getTwitterConfig,
};
