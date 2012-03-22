// An example of how to use the UntappdClient.
//
// By Glen R. Goodwin
// twitter: @areinet

// Imports
var UntappdClient = require("./UntappdClient",false);

// Definitions

// Replace this with your API KEY
var apikey = "[ your api key goes here ]";

// Replace this if you are using authentication with your USERNAME, as a String.
var username = null;

// Replace this if you are using authentication with your PASSWORD.
// This MUST be a Hex encoded MD5 Hash.  To encode a password such you can
// do the following in node: 
//
// 		 require("crypto").createHash("md5").update("password").digest("hex");
//
// replacing "password" with a string of your password.
var password = null; 

// Set to true if you want to see all sort of nasty output on stdout.
var debug = true;

//The user we want to lookup for this example.
var lookupuser = "arei";

// Create Client
var untappd = new UntappdClient(apikey,null,null,debug);

// EXAMPLE - List last 25 recent checkins of the given user
untappd.userFeed(function(err,obj){
	if (debug) console.log(err,obj);
	if (obj && obj.results) {
		var beers = obj.results.forEach(function(checkin){
			console.log("\n"+username,"drank",checkin.beer_name);
			console.log("by",checkin.brewery_name);
			if (checkin.venue_name) console.log("at",checkin.venue_name);
			console.log("on",checkin.created_at);
		});
	}
	else {
		console.log(err,obj);
	}
},lookupuser);
