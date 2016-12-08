var vo = require('vo');
var fs = require('fs');
var http = require('http');
var sqlite3 = require('sqlite3').verbose();

vo(run)(function(err, result) {
    if (err) throw err;
});

// 1. Get movie by title http://movieposterdb.com/json/SearchAC/phrase=Fargo
/*
[{"name":"Fargo Express (1933)","value":"22880","type":"Movie"},{"name":"Fargo (1996)","value":"116282","type":"Movie"},{"name":"Wells Fargo Gunmaster (1951)","value":"44203","type":"Movie"},{"name":"The Fargo Kid (1940)","value":"33587","type":"Movie"},{"name":"Fargo (1952)","value":"44603","type":"Movie"},{"name":"The Fargo Phantom (1950)","value":"228290","type":"Movie"},{"name":"Wells Fargo (1937)","value":"29752","type":"Movie"},{"name":"Fighting Bill Fargo (1941)","value":"33601","type":"Movie"},{"name":"\u0022Fargo\u0022 (2014)","value":"2802850","type":"TV Show"},{"name":"Linda Fargo","value":"33781","type":"Person"}]
*/

// 2. Extract mid (value) with right year
// 3. Get Movie details -> http://movieposterdb.com/json/Movie/mid=116282
/*
{"movieinfos":{"movie_id":"239","imdb":"116282","year":"1996","releasedate":"April, 5, 1996","title":"Fargo","overview":"Jerry, a small-town Minnesota car salesman is bursting at the seams with debt... but he's got a plan. He's going to hire two thugs to kidnap his wife in a scheme to collect a hefty ransom from his wealthy father-in-law. It's going to be a snap and nobody's going to get hurt... until people start dying. Enter Police Chief Marge, a coffee-drinking, parka-wearing - and extremely pregnant - investigator who'll stop at nothing to get her man. And if you think her small-time investigative skills will give the crooks a run for their ransom... you betcha!","Countries":["us"],"amazonad":null},"groups":[{"group_id":"69596","num_posters":"9","file_location":"12_03\/1996\/116282\/t_116282_6cdef3aa.jpg","Posterhash":"6cdef3aa","width":"2045","height":"2943","country":"us"},{"group_id":"47368","num_posters":"7","file_location":"05_08\/1996\/0116282\/t_46816_0116282_a264f0a1.jpg","Posterhash":"a264f0a1","width":"1527","height":"2173","country":"us"},{"group_id":"75763","num_posters":"5","file_location":"06_08\/1996\/0116282\/t_128745_0116282_126d6758.jpg","Posterhash":"126d6758","width":"2880","height":"4224","country":"us"},{"group_id":"47034","num_posters":"3","file_location":"05_11\/1996\/0116282\/t_65605_0116282_4a662a26.jpg","Posterhash":"4a662a26","width":"559","height":"800","country":"uk"},{"group_id":"1177471","num_posters":"2","file_location":"15_04\/1996\/116282\/t_116282_59e0366f.jpg","Posterhash":"59e0366f","width":"1874","height":"2500","country":"uk"},{"group_id":"107914","num_posters":"2","file_location":"05_11\/1996\/0116282\/t_65608_0116282_691d994a.jpg","Posterhash":"691d994a","width":"300","height":"502","country":"de"},{"group_id":"26378","num_posters":"2","file_location":"05_10\/1996\/0116282\/t_58706_0116282_c92a7636.jpg","Posterhash":"c92a7636","width":"580","height":"938","country":"ar"},{"group_id":"78160","num_posters":"1","file_location":"06_05\/1996\/0116282\/t_114488_0116282_427f10ff.jpg","Posterhash":"427f10ff","width":"404","height":"570","country":"jp"},{"group_id":"282242","num_posters":"1","file_location":"09_11\/1996\/116282\/t_116282_2873392d.jpg","Posterhash":"2873392d","width":"720","height":"1019","country":"pt"},{"group_id":"1061134","num_posters":"1","file_location":"14_08\/1996\/116282\/t_116282_4e058c79.jpg","Posterhash":"4e058c79","width":"2006","height":"3000","country":"us"},{"group_id":"9996","num_posters":"1","file_location":"05_11\/1996\/0116282\/t_65609_0116282_728b261c.jpg","Posterhash":"728b261c","width":"1008","height":"1439","country":"us"},{"group_id":"239320","num_posters":"1","file_location":"09_08\/1996\/116282\/t_116282_7463b37f.jpg","Posterhash":"7463b37f","width":"2000","height":"2880","country":"us"},{"group_id":"1045549","num_posters":"1","file_location":"14_06\/1996\/116282\/t_116282_b8493ad4.jpg","Posterhash":"b8493ad4","width":"3508","height":"4961","country":"us"},{"group_id":"78063","num_posters":"1","file_location":"07_11\/1996\/116282\/t_116282_ff03a5db.jpg","Posterhash":"ff03a5db","width":"842","height":"1181","country":"de"},{"group_id":"1000018","num_posters":"1","file_location":"14_04\/1996\/116282\/t_116282_493fd702.jpg","Posterhash":"493fd702","width":"1099","height":"1760","country":"se"},{"group_id":"54257","num_posters":"1","file_location":"06_09\/1996\/0116282\/t_134382_0116282_39a5928a.jpg","Posterhash":"39a5928a","width":"484","height":"782","country":"it"},{"group_id":"528738","num_posters":"1","file_location":"11_09\/1996\/116282\/t_116282_3c849d12.jpg","Posterhash":"3c849d12","width":"1580","height":"2000","country":"us"}],"Crew":{"Director":[{"PersID":"3757","Name":"Joel Coen","imdb":"1054"}],"Cast":[{"PersID":"1706","Name":"William H. Macy","imdb":"513"},{"PersID":"1731","Name":"Frances McDormand","imdb":"531"},{"PersID":"1837","Name":"Steve Buscemi","imdb":"114"},{"PersID":"4201","Name":"Peter Stormare","imdb":"1780"},{"PersID":"34822","Name":"Kristin Rudrud","imdb":"749021"},{"PersID":"19229","Name":"Harve Presnell","imdb":"696193"},{"PersID":"9581","Name":"Tony Denman","imdb":"219301"},{"PersID":"13184","Name":"Gary Houston","imdb":"396828"},{"PersID":"4484","Name":"John Carroll Lynch","imdb":"2253"},{"PersID":"34820","Name":"Steve Reevis","imdb":"716324"},{"PersID":"18617","Name":"Steve Park","imdb":"661950"},{"PersID":"34203","Name":"Larry Brandenburg","imdb":"104594"},{"PersID":"31261","Name":"Melissa Peterman","imdb":"676292"}]}}
*/
// 4. Get pid (Posterhash) with country == de
// 5. Get poster -> http://movieposterdb.com/json/Poster/pid=ff03a5db
/*
{"Details":{"poster_id":"169640","group_id":"78063","imdb":"116282","Posterhash":"ff03a5db","file_location":"07_11\/1996\/116282\/o_116282_ff03a5db.jpg","country_code":"DE","Uploaddate":"November, 12, 2007","width":"842","height":"1181","size":"489697","Releaseyear":"1996","title":"Fargo","user_id":"4243","username":"richard3rd","medium_location":"\/img\/posters\/07_11\/1996\/116282\/m_116282_ff03a5db.jpg","sizekb":478},"GroupPosters":[{"poster_id":"169640","country":"de","file_location":"07_11\/1996\/116282\/t_116282_ff03a5db.jpg","width":"842","height":"1181","Posterhash":"ff03a5db"}],"Credits":null}
*/
// 6. Get Image by medium_location URL -> http://movieposterdb.com//img//posters//07_11//1996//116282//m_116282_ff03a5db.jpg


//currently the script runs only with defined MAX_PAGE
function * run() {

	var db = new sqlite3.Database('data/movies.sqlite');
	var tableName = "movies";

    var orginalTitles = ["Fargo"];
    var germanTitles = ["Fargo"];
    var years = ["1996"];
	var urlFindMovie = 'http://movieposterdb.com/json/SearchAC/phrase=';
	var urlGetMovie = 'http://movieposterdb.com/json/Movie/mid=';
	var urlGetPoster = 'http://movieposterdb.com/json/Poster/pid=';
	var urlGetImage = 'http://movieposterdb.com//img/posters/';

	var data = {};

	function insertRow(row)
	{
		console.log("Insert Row!");
		db.serialize(function() {

		  var stmt = db.prepare("INSERT INTO "+tableName+" (imdb, title, german_title, year, country, pid, image_location) VALUES ($imdb, $title, $german_title, $year, $country, $pid, $image_location)", {
		  	$imdb : row.imdb,
		  	$title : row.title,
		  	$german_title : row.german_title,
		  	$year : row.year,
		  	$country : row.country,
		  	$pid : row.pid,
		  	$image_location : row.image_location
		  });

		  stmt.run();
		  stmt.finalize();

		});		
	}

	function findMovie(movie)
	{
		function isYear(element) {
			var patt = new RegExp(movie.year);
			var res = patt.test(element.name);

		  	return res;
		}

		http.get(urlFindMovie + movie.title, function(res){
		    var body = '';

		    res.on('data', function(chunk){
		        body += chunk;
		    });

		    res.on('end', function(){

		    	try {
			        var response = JSON.parse(body);

			        if (response != null)
			        {
				        response.forEach( function(element, index) {
				        	if (isYear(element) && element.type == "Movie")
				        	{
								console.log("Found Movie: ", element);
								getMovie(element.value, movie);
				        	}
				        });
			        }
		    	} catch(e) {
		    		// statements
		    		console.log(e);
		    	}



		        //console.log("Got a response: ", response);
		    });
		}).on('error', function(e){
		      console.log("Got an error: ", e);
		});
	}

	function getMovie(mid, movie)
	{
		function isGermany(element) {
			var patt = new RegExp("de");
		  	return patt.test(element.country);
		}

		http.get(urlGetMovie + mid, function(res){
		    var body = '';

		    res.on('data', function(chunk){
		        body += chunk;
		    });

		    res.on('end', function(){

		    	try {
			        var response = JSON.parse(body);

			        if (response != null)
			        {
				        response.groups.forEach( function(element, idx) {
				        	if (isGermany(element))
				        	{
				        		data.title = response.movieinfos.title;
				        		data.year = response.movieinfos.year;
				        		data.country = response.movieinfos.Countries;
				        		data.imdb = response.movieinfos.imdb;
				        		data.german_title = movie.german_title;
				        		data.pid = element.Posterhash;

								console.log("Found German Poster: ", element);
								getPoster(element.Posterhash);
								return false;
				        	}

				        });
			        }
		    	} catch(e) {
		    		// statements
		    		console.log(e);
		    	}



		        //console.log("Got a response: ", response);
		    });
		}).on('error', function(e){
		      console.log("Got an error: ", e);
		});
	}

	function getPoster(pid)
	{
		http.get(urlGetPoster + pid, function(res){
		    var body = '';

		    res.on('data', function(chunk){
		        body += chunk;
		    });

		    res.on('end', function(){
		        
		        try {
		        	var response = JSON.parse(body);
			        if (response != null)
			        {
				        data.image_location = urlGetImage + response.Details.medium_location;
				        insertRow(data);
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

	fs.readFile('data/movies.json', 'utf8', function(err, data){
		

		try {
			var m = JSON.parse(data);
			var timeout = 2000;
			m.forEach( function(element, index) {
				//console.log("Looking for " +element.title + " (" + element.year + ")");
				setTimeout(function(){console.log(index + ": Looking for " +element.title + " (" + element.year + ")");findMovie(element);}, timeout*index);
			});
		} catch(e) {
			// statements
			console.log(e);
		}

	});
	

	
	//console.log(obj);

	//db.close();


	/*
    console.dir(data);
    data = JSON.stringify(data, null, 2)

    //write results to timestamped json file
    results = './results'

    if(!fs.existsSync(results)){
        fs.mkdirSync(results);
    }
    fs.writeFile('results/output.json', data, 'utf8');
    yield nightmare.end();
    */
}