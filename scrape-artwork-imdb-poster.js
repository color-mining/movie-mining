var vo = require('vo');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var Nightmare = require('nightmare');

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	var db = new sqlite3.Database('data/movies.sqlite');
	var dbResults = new sqlite3.Database('data/results.sqlite');
	var moviesTable = "movies_imdb";
	var movies = [];
	var index = 0;
	var startTime = (new Date().getTime());
	var elapsedTime = 0;
	var totalTime = 0;

	function parseTitlePage(rows)
	{
		var nightmare = Nightmare();
		var row = (rows != undefined && rows.length > 0) ? rows[0] : movies[index++];
		elapsedTime = (new Date().getTime()) - startTime;
		totalTime += elapsedTime;
		startTime = (new Date().getTime());

		console.log(index + " of " + movies.length + " (" + row.imdb +", "+secondsToString(Math.floor((totalTime / index) * (movies.length - index))) +")");
		nightmare.goto("http://www.imdb.com/title/"+row.imdb+"/?ref_=ttmi_tt")
		.wait('#pagecontent')
		.wait(2000)
		.evaluate(function(row) {
			var image = {};
			image.id = row.id;
			image.imdb = row.imdb;
			image.url = "N/A";

			$('.poster a').each(function(idx, item){	
				image.url = "http://www.imdb.com" + $(this).attr("href");
			});

			return image;
		}, row)
		.end()
		.then(function(image){
			insertRow(image);
			if (index < movies.length) parseTitlePage();
		})
		.catch(function(error) {
			console.error('error', error);
			insertError(row, error);
			if (movies.length > 0) parseTitlePage();
		});
	}

	function getMoviesFromDb()
	{
		db.serialize(function() {
			db.all("SELECT id, imdb FROM " + moviesTable + " WHERE image_location_high NOT NULL AND image_location_high != 'N/A'", function(err, rows) {
				movies = rows;
				if (movies.length > 0) parseTitlePage();
			});
		});
	}

	function secondsToString(seconds)
	{
		var date = new Date(null);
		date.setSeconds(seconds);
		return date.toISOString().substr(11, 8);
	}

	

	function getErrorsFromDb()
	{
		var errorTable = "imdb_photo_errors";
		dbResults.serialize(function() {
			dbResults.each("SELECT id, imdb, p_id FROM " + errorTable, function(err, row) {

				dbResults.serialize(function() {
					console.log(row);
					dbResults.all("SELECT id, imdb, idx, url FROM " + mediaLinksTable + " WHERE id = " + row.p_id , function(err, rows) {
						console.log(rows.length + " : " + allRows.length);
						if (rows.length > 0) parseMediaPage(rows);
					});
				});

			});
		});
	}

	function insertRow(row)
	{
		var tableName = "imdb_poster_results";

		dbResults.serialize(function() {

		  var stmt = dbResults.prepare("INSERT INTO "+tableName+" (imdb, movie_id, url) VALUES ($imdb, $movie_id, $url)", {
		  	$imdb : row.imdb,
		  	$movie_id : row.id,
		  	$url : row.url
		  });

		  stmt.run();
		  stmt.finalize();

		});		
	}

	function insertError(row, error)
	{
		var tableName = "imdb_poster_errors";

		dbResults.serialize(function() {

		  var stmt = dbResults.prepare("INSERT INTO "+tableName+" (imdb, p_id, error) VALUES ($imdb, $p_id, $error)", {
		  	$imdb : row.imdb,
		  	$p_id : row.id,
		  	$error : error
		  });

		  stmt.run();
		  stmt.finalize();

		});		
	}

	getMoviesFromDb();
	//getErrorsFromDb();
}