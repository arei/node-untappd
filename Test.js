// This tests a client connection to untapped.
// We're only doing read-only tests. Anything which would modify you
// can figure out for yourself.
//
// By Glen R. Goodwin
// twitter: @areinet

// Imports
var UntappdClient = require("./UntappdClient");

// Definitions
var clientId = process.env['UNTAPPD_CLIENT_ID'] || '';
var clientSecret = process.env['UNTAPPD_CLIENT_SECRET'] || '';
var accessToken = process.env['UNTAPPD_ACCESS_TOKEN'] || '';

var debug = false;

var sampleUser = "arei";
var beer_id = "1";
var brewery_id = "1";
var venue_id = "1";
var foursquare_id = "4ccf5fec1ac7a1cd6a5c1392";

// Handles testing our results
var goodbadResults = function(name) {
	return function(err, obj) {
		if (debug) console.log(name, err, obj);
		if (err || !obj || obj.meta.code>=400 || !obj.response) {
			console.log("[ FAIL ] " + name);
			console.error("\t" + obj.meta.error_detail);
			return;
		}
		console.log("[ PASS ] " + name);
	};
};

console.log("Testing all the READ-ONLY Services for Untappd");
console.log("----------------------------------------------");

// Create Client
var untappd = new UntappdClient(debug);
untappd.setClientId(clientId);
untappd.setClientSecret(clientSecret);
untappd.setAccessToken(accessToken);

// get the url for getting an oauth token
console.log("[ INFO ] OAUTH Url: "+untappd.getUserAuthenticationURL("http://localhost:3000/auth"));
console.log("");

// Test userActivityFeed
untappd.userActivityFeed(goodbadResults("userActivityFeed"),{USERNAME: sampleUser});

// Test pubFeed
untappd.pubFeed(goodbadResults("pubFeed"), {lat: 40, lng: 74});

// Test venueActivityFeed
untappd.venueActivityFeed(goodbadResults("venueActivityFeed"),{VENUE_ID:venue_id});

// Test beerActivityFeed
untappd.beerActivityFeed(goodbadResults("beerActivityFeed"),{BID: beer_id});

// Test breweryFeed
untappd.breweryActivityFeed(goodbadResults("breweryActivityFeed"),{BREWERY_ID: brewery_id});

// Test userInfo
untappd.userInfo(goodbadResults("userInfo"),{USERNAME: sampleUser});

// Test userWishList
untappd.userWishList(goodbadResults("userWishList"),{USERNAME: sampleUser});

// Test userFriends
untappd.userFriends(goodbadResults("userFriends"),{USERNAME: sampleUser});

// Test userBadges
untappd.userBadges(goodbadResults("userBadges"),{USERNAME: sampleUser});

// Test userDistinctBeers
untappd.userDistinctBeers(goodbadResults("userDistinctBeers"),{USERNAME: sampleUser});

// Test brewerInfo
untappd.breweryInfo(goodbadResults("brewerInfo"),{BREWERY_ID: brewery_id});

// Test beerInfo
untappd.beerInfo(goodbadResults("beerInfo"),{BID: beer_id});

// Test venueInfo
untappd.venueInfo(goodbadResults("venueInfo"),{VENUE_ID: venue_id});

// Test Beer Search
untappd.beerSearch(goodbadResults("searchBeer"),{q:"Stout"});

// Test Brewery Search
untappd.brewerySearch(goodbadResults("searchBrewery"),{q:"Stone"});

// Test foursquareVenueLookup
untappd.foursquareVenueLookup(goodbadResults("foursquareVenueLookup"),{VENUE_ID: foursquare_id});
