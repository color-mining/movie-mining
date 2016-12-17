var vo = require('vo');
var fs = require('fs');
var http = require('http');
var https = require('https');
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
			db.each("SELECT id, imdb, image_location_high AS url FROM " + moviesTable + " WHERE url != 'N/A'", function(err, row) {

				setTimeout(function(){
					console.log(row.id + ": " + row.imdb + " : " + row.url);
					adapterFor(row.url).get(row.url, function(data) { 
						var fileDest = 'results/imdb/high/'+ row.imdb +'.jpg';
						var file = fs.createWriteStream(fileDest);
						data.pipe(file);
					});//http.get
				}, timeout*index);

				index++;
			});
		});
	}

	var adapterFor = (function() {
	var url = require('url'),
		adapters = {
			'http:': http,
			'https:': https
		};

		return function(inputUrl) {
			return adapters[url.parse(inputUrl).protocol]
		}
	}());

	getMoviesFromDb();

}