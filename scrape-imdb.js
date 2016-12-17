var vo = require('vo');
var fs = require('fs');
var Nightmare = require('nightmare');
var sqlite3 = require('sqlite3').verbose();

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	var nightmare = Nightmare();
	var db = new sqlite3.Database('data/movies.sqlite');
	var tableName = "movies_imdb";
	var data = [];
	var pages = 75;
	var sorting = "desc";

	function insertRow(row)
	{
		db.serialize(function() {

		  var stmt = db.prepare("INSERT INTO "+tableName+" (imdb, german_title, year, runtime, genre, rating, gross, image_location) VALUES ($imdb, $german_title, $year, $runtime, $genre, $rating, $gross, $image_location)", {
		  	$imdb : row.imdb,
		  	$german_title : row.german_title,
		  	$year : row.year,
		  	$runtime : row.runtime,
		  	$rating : row.rating,
		  	$genre : row.genre,
		  	$gross : row.gross,
		  	$image_location : row.image_location
		  });

		  stmt.run();
		  stmt.finalize();

		});		
	}

	// imdb allows only 10.000 titles per search, so after page 200 (50 items per page) we get an 404
	// a workaround is to sorts the list alphabetical and grap the first 10.000 titles, than we reverse the order and get the remaining 3.637 titles

	for (var page = 1; page <= pages; page++)
	{
		//var url = "http://www.imdb.com/search/title?title_type=feature&primary_language=de&page="+page+"&view=advanced&sort=alpha,"+sorting+"&ref_=adv_nxt";
		var url = "http://www.imdb.com/search/title?countries=de&title_type=feature&sort=alpha,"+sorting+"&page="+page+"&ref_=adv_nxt";

		yield nightmare
			.goto(url)
			.wait('#main')
			.evaluate(function(page) {

				var movies = [];
				$('.lister-item').each(function(index, item){

					var movie = new Object();
					var $item = $(this);
					var $header = $item.find('.lister-item-header');
					var $meta = $item.find('p.text-muted');
					var $artwork = $item.find('.lister-item-image');
					var $sort = $item.find('.sort-num_votes-visible');

					movie.imdb = $("img", $artwork).attr("data-tconst");
					movie.german_title = $("a", $header).text();

					movie.year = $(".lister-item-year", $item).text();
					var matches = movie.year.match(/\b\d{4}\b/g);
					if (matches != null && matches.length >= 0) movie.year = matches[0];
					else movie.year = -1;

					movie.runtime = parseInt($(".runtime", $meta).text().trim());
					movie.genre = $(".genre", $meta).text().trim();
					movie.image_location = $("img", $artwork).attr("src");

					var hasGross = false;
					var grossIndex = 0;
					$("span", $sort).each(function(index, item){
						if ($(this).text().trim() == "Gross:")
						{
							hasGross = true;
							return false;
						}
					});

					if (hasGross)
					{
						movie.gross = $("span:nth-child("+grossIndex+")", $sort).attr("data-value") || "";
					}
					else movie.gross = "";
					

					movie.rating = $(".ratings-imdb-rating", $item).attr("data-value") || "";
					if (movie.rating != "") movie.rating = movie.rating.replace(",", ".");

					movies.push(movie);

				});

				return movies;

			}, page)
			.then(function(movies){
				console.log(page + ": Insert movies into database ...");
				console.log("-----------------------------------------------");
				movies.forEach( function(element, index) {
					console.log(index + ": " + element.german_title);
					insertRow(element);
				});
				console.log("-----------------------------------------------");
				console.log("Page " + page + " done.");
			})
			.catch(function(error) {
				console.error('error', error);
			});

	}

	yield nightmare.end();
	db.close();
}