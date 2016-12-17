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
	var moviesTable = "movies_imdb";
	var colorsTable = "colors_imdb";
	var dir = "results/imdb/high/";


	function generateColors(file, movie)
	{
		Jimp.read(dir + file, function (err, image) {

			if (image != null && image != undefined)
			{
				console.log(movie.id + ": " + movie.imdb + " : " + movie.title);

				var palette = ColorThief.getPalette(image, 10);
				var rows = [];

				palette.forEach( function(element, index) {
					rows.push({movie_id: movie.id, r: element[0], g: element[1], b: element[2]})
				});

				insertColors(rows);
			}

		}).catch(function (err) {
   			 console.error(err);
		});
	}

	function insertColors(rows)
	{
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
			db.each("SELECT id, imdb, title FROM " + moviesTable + " WHERE image_location_high != 'N/A'", function(err, row) {
				generateColors(row.imdb + ".jpg", row);
			});
		});
	}

	getMoviesFromDb();
}