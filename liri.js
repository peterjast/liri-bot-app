require("dotenv").config();
var Spotify = require("node-spotify-api");
var keys = require("./keys");
var axios = require('axios');
var moment = require("moment");
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var action = process.argv[2];
var input = process.argv.slice(3).join(" ");

switch (action) {
    case "concert-this":
        getConcert(input);
        break;

    case "spotify-this-song":
        getSong(input);
        break;

    case "movie-this":
        getMovie(input);
        break;

    case "do-what-it-says":
        getRandom();
        break;

    default:
        console.log("You must pass an action [concert-this, spotify-this-song, movie-this, do-what-it-says] and a value");
        console.log("Example: node liri.js movie-this Rocky");
}


function getConcert(input) {
    if (!input) {
        input = "Metallica"
        console.log("You have not entered an Artist or Band but...");
    };

    axios.get('https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp')
        .then(function (response) {
            var bands = response.data;
            var venueName = bands[0].venue.name;
            var venueCity = bands[0].venue.city;
            var venueRegion = bands[0].venue.region;
            var venueCountry = bands[0].venue.country;
            var timeUTC = bands[0].datetime;
            console.log(input + "'s next show is at: " + venueName + '.');
            console.log("It's going to take place in " + venueCity + ', ' + venueRegion + ', ' + venueCountry + '.');
            var time = moment(timeUTC).format('MM/DD/YYYY');
            console.log('This show is on ' + time);
        })
        .catch(function (error) {
            console.log(error.response.data);
            console.log('Please try again!');
        });
}

function getSong(input) {
    if (!input) {
        input = "The Sign Ace of Base";
    }

    spotify
        .search({ type: 'track', query: input, limit: 3}, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            for (var i = 0; i < data.tracks.items[0].album.artists.length; i++) {
                console.log("Artist(s): " + data.tracks.items[0].album.artists[i].name);
                console.log("Song: " + data.tracks.items[0].name);
                console.log("Album: " + data.tracks.items[0].album.name);
                console.log("Song Link: " + data.tracks.items[0].external_urls.spotify);
            }
        });
}

function getMovie(input) {
    if (!input) {
        var movieName = "Mr+Nobody";
        console.log("You have not entered a movie to search for but...");
        console.log("If you haven't watched 'Mr. Nobody', then you should: http://www.imdb.com/title/tt0485947/");
        console.log("It's on Netflix!");
    }
    else {
        movieName = input.split(" ");
        movieName = movieName.join("+");
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    axios.get(queryUrl).then(
        function (response) {
            console.log("Movie title: " + response.data.Title);
            console.log("Release Year: " + response.data.Year);
            console.log("The movie's rating is: " + response.data.imdbRating);
            console.log("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value);
            console.log("Country where the movie was produced: " + response.data.Country);
            console.log("Language of the movie: " + response.data.Language);
            console.log("Plot: " + response.data.Plot);
            console.log("Actors: " + response.data.Actors);
        })
        .catch(function (error) {
            console.log(error);
            console.log('Please try again!');
        });
}

function getRandom() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");

        if (dataArr[0] === "spotify-this-song") {
            getSong(dataArr[1]);
        }
        else if (dataArr[0] === "movie-this") {
            getMovie(dataArr[1]);
        }
        else if (dataArr[0] === "concert-this") {
            getConcert(dataArr[1]);
        }
        else {
            console.log("Nothing to do!");
        }
    });
}