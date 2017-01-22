const fs = require('fs');
const util = require('util')
const jimp = require("jimp");
const sqlite3 = require('sqlite3').verbose();


var db = new sqlite3.Database('data/movies.sqlite');
var dbResults = new sqlite3.Database('data/results.sqlite');
const inputDir = "results/imdb/filtered/poster/";
const outputDir = "results/imdb/filtered/poster_unique/";
var files = [];
var movies = [];

function getImages(a, b, callback)
{
	jimp.read(inputDir + a, function (err, image) {
		var imageA = {image: image, filename: a};
		jimp.read(inputDir + b, function (err, image) {
			var imageB = {image: image, filename: b};
			callback(imageA, imageB);
		}).catch(function (err) {
   			 console.error(err);
   			 return;
		});			
	}).catch(function (err) {
			 console.error(err);
			 return;
	});
}

function saveImage(filename)
{
	jimp.read(inputDir + filename, function (err, image) {

		this.write(outputDir + filename);

	}).catch(function (err) {
			 console.error(err);
	});
}

function insertCompareResult(row, error)
{
	var tableName = "imdb_compare_results";

	db.serialize(function() {

	  var stmt = dbResults.prepare("INSERT INTO "+tableName+" (imdb, filename, filename_b, distance, difference) VALUES ($imdb, $filename, $filename_b, $distance, $difference)", {
	  	$imdb : row.imdb,
	  	$filename : row.filename,
	  	$filename_b : row.filename_b,
	  	$distance : row.distance,
	  	$difference : row.difference
	  });

	  stmt.run();
	  stmt.finalize();

	});		
}

function isPoster(image)
{
	return (image.bitmap.width <= image.bitmap.height);
}

function compareImages(images, imdb)
{
	var counter = 0;
	var compared = {};

	console.log("Testing:\t" + images.length + " Image(s)\t(Movies left: \t" + movies.length + ")");

	function compare(a, b)
	{
		counter--;
		var distance = jimp.distance(a.image, b.image); // perceived distance
		var diff = jimp.diff(a.image, b.image);         // pixel difference

		// save results in dbase
		insertCompareResult({imdb: imdb, filename: a.filename, filename_b: b.filename, distance: distance, difference: diff.percent});
		insertCompareResult({imdb: imdb, filename: b.filename, filename_b: a.filename, distance: distance, difference: diff.percent});

		if (!compared.hasOwnProperty(a.filename)) compared[a.filename] = [];
		if (compared[a.filename].length == 0) compared[a.filename].push(a);

		if (distance < 0.25 || diff.percent < 0.25)
		{
			console.log("    Images are equal "+ distance + "\t" + diff.percent);
			compared[a.filename].push(b);
		}
		else
		{
			console.log("    Images don't match:  " + distance + "\t" + diff.percent);
			//if (!compare.hasOwnProperty(b.filename)) compare[b.filename] = [b];
			//saveToPosterDir(a.image, a.filename);
		}

		if (counter <= 0)
		{
			var unique = {};

			for (var i = 0; i < images.length; i++)
			{
				unique[images[i]] = null;
			}

			for (var key in compared)
			{
				var img = compared[key];

				for (var i = 0; i < img.length; i++)
				{
					if (key != img[i].filename && unique.hasOwnProperty(img[i].filename))
					{
						if (!delete unique[img[i].filename]) {throw new Error();}
					}
				}
			}

			for (var key in unique)
			{
				console.log("\tSaving: " + key);
				saveImage(key);
			}

			next();
		}
	}

	if (images.length > 1)
	{
		for (var i = 0; i < images.length; i++)
		{
			for (var k = i + 1; k < images.length; k++)
			{
				counter++;
				getImages(images[i], images[k], compare);
			}
		}
	}
	else if (images.length > 0)
	{
		counter++;
		getImages(images[0], images[0], compare);
	}
}

function next()
{
	var images = null;
	var imdb = null;

	for (var key in movies)
	{
		images = movies[key];
		imdb = key;
		if (!delete movies[key]) {throw new Error();}
		break;
	}

	if (images != null)
	{
		compareImages(images, imdb);
	}	
}

function loadDir()
{
	files = fs.readdirSync(inputDir);

	for (var i = 0; i < files.length; i++)
	{
		var imdb = files[i].split("_")[0];
		if (!movies.hasOwnProperty(imdb)) movies[imdb] = [];
 		movies[imdb].push(files[i]);
	}
	//console.log(movies);
	next();
}

loadDir();
