// An example of how to use the UntappdClient.
//
// By Glen R. Goodwin
// twitter: @areinet

// Imports
var UntappdClient = require("./UntappdClient",false);

// Definitions

// Replace this with your CLIENT ID
var clientId = "[ your api key goes here ]";

// Replace this with your CLIENT SECRET
var clientSecret = "[ your client secret goes here ]";

// Set to true if you want to see all sort of nasty output on stdout.
var debug = false;

//The user we want to lookup for this example.
var lookupuser = "arei";

// Create Client
var untappd = new UntappdClient(debug);
untappd.setClientId(clientId);
untappd.setClientSecret(clientSecret);

// EXAMPLE - List last 25 recent checkins of the given user
untappd.userFeed(function(err,obj){
	if (debug) console.log(err,obj);
	if (obj && obj.response && obj.response.checkins && obj.response.checkins.items) {
		var beers = obj.response.checkins.items.forEach(function(checkin){
			//console.log(checkin);
			console.log("\n"+checkin.user.user_name,"drank",checkin.beer.beer_name);
			console.log("by",checkin.brewery.brewery_name);
			if (checkin.venue.venue_name) console.log("at",checkin.venue.venue_name);
			console.log("on",checkin.created_at);
		});
	}
	else {
		console.log(err,obj);
	}
},lookupuser);
