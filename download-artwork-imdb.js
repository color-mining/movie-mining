var vo = require('vo');
var fs = require('fs');
var http = require('http');
var https = require('https');
var sqlite3 = require('sqlite3').verbose();
var Nightmare = require('nightmare');

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	var db = new sqlite3.Database('data/results.sqlite');
	var table = "imdb_photo_results";
	var allRows = [];
	var index = 0;

	function getImage(rows)
	{
		var row = (rows != undefined && rows.length > 0) ? rows[0] : allRows[index++];
		if (row.imdb == null) getImage();

		setTimeout(function(){
			console.log(index + " of "+ allRows.length + " : " + row.id + ": " +row.imdb);
			adapterFor(row.url).get(row.url, function(data){

			    if (data.statusCode !== 200)
			    {
			        console.log("Error while downloading file (404)");
					insertError(row, e);
					if (index < allRows.length) getImage();
			    }
			    else
			    {
					var fileDest = 'results/imdb/media_new/'+ row.imdb +'_'+row.idx+'.jpg';
					var file = fs.createWriteStream(fileDest);
					data.pipe(file);
					if (index < allRows.length) getImage();
			    }


			}).on('error', function(e) {
				console.log("error: ", e);
				insertError(row, e);
				if (index < allRows.length) getImage();
			});
		}, 1000);
	}


	function getMoviesFromDb()
	{
		db.serialize(function() {
			db.all("SELECT id, imdb, idx, url FROM " + table + " WHERE id > 18331", function(err, rows) {
				allRows = rows;
				if (allRows.length > 0) getImage();
			});
		});
	}


	function insertError(row, error)
	{
		var tableName = "imdb_image_errors";

		db.serialize(function() {

		  var stmt = dbResults.prepare("INSERT INTO "+tableName+" (imdb, p_id, error) VALUES ($imdb, $p_id, $error)", {
		  	$imdb : row.imdb,
		  	$p_id : row.id,
		  	$error : error
		  });

		  stmt.run();
		  stmt.finalize();

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