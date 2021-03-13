
/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err.message);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')

    //Retrieve movies
    .get(function (req, res) {
        if (!req.body.title) {
            res.json({success: false, message: 'Please submit title of the movie you wish to find.'});
        } else {
            var title_query = req.body.title;
            console.log(req.body.title);
            Movie.findOne({title: title_query}, function (err, movie) {
                if (err) res.send(err);
                else
                res.json({success: true, message: movie});
            });
        }
    })
    //Save movies
    .post(function (req, res) {
        if (!req.body.title || !req.body.genre || !req.body.year || !req.body.actors && req.body.actors.length) {
            res.json({success: false, msg: 'Please pass Movie Title, Year released, Genre, and Actors(Actor Name and Character Name)'});
        }
        else {
            if(req.body.actors.length < 3) {
                res.json({ success: false, message: 'Please include at least three actors.'});
            }
            else {
                var movie = new Movie(req, res);
                movie.Title = req.body.title;
                movie.Year = req.body.year;
                movie.Genre = req.body.genre;
                movie.Actors= req.body.actors;

                movie.save(function(err) {
                    if (err) {
                        if (err.code == 11000)
                            return res.json({ success: false, message: 'A movie with that title already exists.'});
                        else
                            return res.send(err);
                    }
                    res.json({ message: 'Movie successfully created.' });
                });
            }
        }
    })

    .put(function(req, res) {
        if (!req.body.title){
            res.json({success: false, message: 'Please submit title of target movie'});
        } else {
            var title = req.body.title;
            Movie.findOne({title:title},function(err,movie){
                if(movie != null){
                    if (err) res.send(err);

                    if(req.body.year){
                        movie.year = req.body.year;
                    }

                    if(req.body.genre){
                        movie.genre = req.body.genre;
                    }

                    if(req.body.actor_1){
                        movie.actors[0][0] = req.body.actor_1;
                    }
                    if(req.body.actor_2){
                        movie.actors[1][0] = req.body.actor_2;
                    }
                    if(req.body.actor_3){
                        movie.actors[2][0] = req.body.actor_3;
                    }
                    if(req.body.character_1){
                        movie.actors[0][1] = req.body.character_1;
                    }
                    if(req.body.character_2){
                        movie.actors[1][1] = req.body.character_2;
                    }
                    if(req.body.character_3){
                        movie.actors[2][1] = req.body.character_3;
                    }

                    movie.save(function(err){
                        if (err) res.send(err);
                        res.json({success: true, message: 'Movie updated!'});
                    });
                }else{
                    res.json({success: false, message: 'Failed to find movie!'});
                }
            });
        }
    })

    //Delete movies
    .delete(function(req, res) {
        if (!req.body.title){
            res.json({success: false, message: 'Please submit title of the movie you wish to delete.'});
        } else {

            var title = req.body.title;
            Movie.remove({title:title}, function(err, movie) {
                if (err) res.send(err);
                res.json({success: true, message: 'deleted'});
            });
        }
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


