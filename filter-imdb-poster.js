const vo = require('vo');
const fs = require('fs');
const util = require('util')
const jimp = require("jimp");

vo(run)(function(err, result) {
    if (err) throw err;
});

function * run() {

	const inputDir = "results/imdb/media_new/";
	const outputDir = "results/imdb/poster/";
	var files = [];
	var index = 0;

	function isPoster(image)
	{
		return (image.bitmap.width <= image.bitmap.height);
	}

	function getImage()
	{
		var file = files[index++];
		console.log(index + " of " +files.length+ ": Testing " + file);

		jimp.read(inputDir + file, function (err, image) {

			if (image != null && image != undefined)
			{
				if (isPoster(image))
				{
					saveToPosterDir(image, file);
				}
			}

			next();

		}).catch(function (err) {
   			 console.error(err);
   			 next(); 
		});
	}

	function next()
	{
		if (index < files.length) setTimeout(getImage, 250);
	}

	function saveToPosterDir(image, file)
	{
		//console.log("Image saved as poster: " + file);
		image.write(outputDir + file);
	}

	function loadDir()
	{
		files = fs.readdirSync(inputDir);
			
		getImage();
	}

	loadDir();
}