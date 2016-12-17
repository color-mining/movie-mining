var vo = require('vo');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var Nightmare = require('nightmare');

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	var dbResults = new sqlite3.Database('data/results.sqlite');
	var mediaLinksTable = "imdb_media_results";
	var allRows = [];
	var index = 0;

	function parseMediaPage(rows)
	{
		var nightmare = Nightmare();
		var row = (rows != undefined && rows.length > 0) ? rows[0] : allRows[index++];

		console.log(row.id + ": " + row.url);
		nightmare.goto(row.url)
		.wait('#photo-container')
		.wait(2000)
		.evaluate(function(row) {
			var image = {};
			$('.pswp__item img:visible').each(function(idx, item){

				if (/display/.test($(this).attr("style")))
				{
					image.id = row.id;
					image.url = $(this).attr("src");
					image.idx = row.idx;
					image.imdb = row.imdb;
				}
			});

			return image;
		}, row)
		.end()
		.then(function(image){

			insertRow(image);
			if (index < allRows.length) parseMediaPage();
			//else dbResults.close();
		})
		.catch(function(error) {
			console.error('error', error);
			insertError(row, error);
			if (allRows.length > 0) parseMediaPage();
		});
	}

	function getMoviesFromDb()
	{
		dbResults.serialize(function() {
			dbResults.all("SELECT id, imdb, idx, url FROM " + mediaLinksTable + " WHERE id > 328" , function(err, rows) {
				allRows = rows;
				if (allRows.length > 0) parseMediaPage();
			});
		});
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
						//allRows.concat(rows);
						if (rows.length > 0) parseMediaPage(rows);
					});
				});

			});
		});
	}

	function insertRow(row)
	{
		var tableName = "imdb_photo_results";

		dbResults.serialize(function() {

		  var stmt = dbResults.prepare("REPLACE INTO "+tableName+" (id, imdb, idx, url) VALUES ($id, $imdb, $index, $url)", {
		  	$id : row.id;
		  	$imdb : row.imdb,
		  	$index : row.idx,
		  	$url : row.url
		  });

		  stmt.run();
		  stmt.finalize();

		});		
	}

	function insertError(row, error)
	{
		var tableName = "imdb_photo_errors";

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

	//getMoviesFromDb();
	getErrorsFromDb();
}