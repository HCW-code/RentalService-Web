const {db} = require('../firebase');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var msg = require ('dialog')
var userdata;

passport.serializeUser(function(user, done) {
    console.log("serial"+user.ID);
    done(null, user.ID);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    done(null, userdata);
});

passport.use(new LocalStrategy({
    usernameField: 'uid',
    passwordField: 'upw'
    }, 
    async function (username, password, done) {
        var dbdata = await db.collection('USER_allow').where("ID", "==", username)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                userdata = doc.data()
                console.log(doc.data().ID);
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
        
        
        console.log("LocalStrategy", username, password);
        if (userdata != undefined) {
            if(password == userdata.Password){
                msg.info("로그인이 되었습니다.!!");
                return done(null, userdata);
            } else {
                msg.info("패스워드가 틀렸습니다.!!");
                return done(null, false, {
                    message: 'Incorrect password.'
            });
            }
        } else {
            msg.info("아이디가 틀렸습니다.!!");
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }
    }
));
