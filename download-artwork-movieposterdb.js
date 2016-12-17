var vo = require('vo');
var fs = require('fs');
var http = require('http');
var sqlite3 = require('sqlite3').verbose();
var ColorThief = require('color-thief-jimp');
var Jimp = require("jimp");

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	var db = new sqlite3.Database('data/movies.sqlite');
	var moviesTable = "movies_movieposterdb";
	var colorsTable = "colors_movieposterdb";

	function insertColors(rows)
	{
		console.log("Insert Row!");

		db.serialize(function() {
			rows.forEach( function(element, index) {

				var stmt = db.prepare("INSERT INTO "+colorsTable+" (movie_id, r, g, b) VALUES ($movie_id, $r, $g, $b)", {
					$movie_id : element.movie_id,
					$r : element.r,
					$g : element.g,
					$b : element.b
				});

				stmt.run();
				stmt.finalize();
				
			});

			
		});	
	}

	function getMoviesFromDb()
	{
		db.serialize(function() {
			var index = 0;
			var timeout = 1000;
			db.each("SELECT id, imdb, image_location AS location FROM " + moviesTable, function(err, row) {
				
				setTimeout(function(){
					console.log(row.id + ": " + row.imdb + " : " + row.location);
					getArtwork(row);
				}, timeout*index);

				index++;

			});
		});
	}

	function getArtwork(movie)
	{
		//var url = movie.location.remove().split("http://movieposterdb.com");
		var location = movie.location.replace("//img/posters/", "");

		console.log("Downloading: " + location);

		/*
		url.forEach( function(element, index) {
			if(index == 0) location += element;
			else location += element.replace("//", "/");
		});

		console.log(location);
		*/


		http.get(location, function(data){

			var fileDest = 'results/img/'+ movie.imdb +'.jpg';
			var file = fs.createWriteStream(fileDest);
			data.pipe(file);

			file.on('finish', function(){

				Jimp.read(fileDest, function (err, image) {
    				if (err) throw err;

					//console.log(image);
					var palette = ColorThief.getPalette(image, 10);
					//console.log(palette);

					var rows = [];

					palette.forEach( function(element, index) {
						rows.push({movie_id: movie.id, r: element[0], g: element[1], b: element[2]})
					});

					insertColors(rows);
    			});

			});//on.finish
		});//http.get
		
	}

	getMoviesFromDb();


}