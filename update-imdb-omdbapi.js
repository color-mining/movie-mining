var vo = require('vo');
var fs = require('fs');
var http = require('http');
var sqlite3 = require('sqlite3').verbose();

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	var db = new sqlite3.Database('data/movies.sqlite');
	var moviesTable = "movies_imdb";

	function getMoviesFromDb()
	{
		db.serialize(function() {
			var index = 0;
			var timeout = 1000;
			db.each("SELECT id, imdb, german_title FROM " + moviesTable + " WHERE (image_location_high is null or image_location_high = '')", function(err, row) {
				
				setTimeout(function(){
					console.log(row.id + ": " + row.imdb + " : " + row.german_title);
					getMovie(row.imdb);
				}, timeout*index);

				index++;

			});
		});
	}

	function updateRow(row)
	{
		db.serialize(function() {

		  var stmt = db.prepare("UPDATE "+moviesTable+" SET title = $title, country = $country, image_location_high = $image WHERE imdb = $imdb", {
		  	$imdb : row.imdbID,
		  	$title : row.Title,
		  	$country : row.Country,
		  	$image : row.Poster
		  });

		  stmt.run();
		  stmt.finalize();

		});		
	}

	function getMovie(imdb)
	{
		var url = "http://www.omdbapi.com/?i="+imdb+"&plot=short&r=json";

		http.get(url, function(res){
		    var body = '';

		    res.on('data', function(chunk){
		        body += chunk;
		    });

		    res.on('end', function(){

		    	try {
			        var response = JSON.parse(body);

			        if (response != null)
			        {
				        updateRow(response);
			        }
		    	} catch(e) {
		    		// statements
		    		console.log(e);
		    	}

		    });
		}).on('error', function(e){
		      console.log("Got an error: ", e);
		});
	}

	 getMoviesFromDb();
}