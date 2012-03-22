// This tests a client connection to untapped.
// We're only doing read-only tests. Anything which would modify you
// can figure out for yourself.
//
// By Glen R. Goodwin
// twitter: @areinet

// Imports
var UntappdClient = require("./UntappdClient",false);

// Definitions
var apikey = "[ your api key goes here ]"; 
var username = "[ your authenticating username goes here ]";
var password = "[ your authenticating password goes here ]";
var debug = false;

var beer_id = "1";
var brewery_id = "1";
var checkin_id = "1";
var venue_id = "1";
var foursquare_id = "4ccf5fec1ac7a1cd6a5c1392";

// Handles testing our results
var goodbad = function(name) {
	return function(err,obj){
		if (debug) console.log(name,err,obj);
		if (err || !obj || obj.http_code>=400) {
			console.log("[ FAIL ] "+name);
			return;
		}
		console.log("[ PASS ] "+name);
	};
};
var goodbadResults = function(name) {
	return function(err,obj){
		if (debug) console.log(name,err,obj);
		if (err || !obj || obj.http_code>=400 || !obj.results) {
			console.log("[ FAIL ] "+name);
			return;
		}
		console.log("[ PASS ] "+name);
	};
};

console.log("Testing all the READ-ONLY Services for Untappd");
console.log("----------------------------------------------");

// Create Client
var untappd = new UntappdClient(apikey,username,password,debug);

// Test Connection
untappd.verify(goodbad("Verify"));

// Test userFeed 
untappd.userFeed(goodbadResults("userFeed"));

// Test friendFeed
untappd.friendFeed(goodbadResults("friendFeed"));

// Test pubFeed
untappd.pubFeed(goodbadResults("pubFeed")); 

// Test venueFeed
untappd.venueFeed(goodbadResults("venueFeed"),venue_id); 

// Test beerFeed
untappd.beerFeed(goodbadResults("beerFeed"),beer_id); 

// Test breweryFeed
untappd.venueFeed(goodbadResults("breweryFeed"),brewery_id); 

// Test checkinInfo
untappd.checkinInfo(goodbadResults("checkinInfo"),checkin_id); 

// Test venueInfo
untappd.venueInfo(goodbadResults("venueInfo"),venue_id); 

// Test beerInfo
untappd.beerInfo(goodbadResults("beerInfo"),beer_id); 

// Test brewerInfo
untappd.brewerInfo(goodbadResults("brewerInfo"),brewery_id); 

// Test userInfo
untappd.userInfo(goodbadResults("userInfo")); 

// Test userBadges
untappd.userBadges(goodbadResults("userBadges")); 

// Test userFriends
untappd.userFriends(goodbadResults("userFriends")); 

// Test userWishList
untappd.userWishList(goodbadResults("userWishList")); 

// Test userDistinctBeers
untappd.userDistinctBeers(goodbadResults("userDistinctBeers")); 

// Test pendingFriends
untappd.pendingFriends(goodbadResults("pendingFriends")); 

// Test activityOnYou
untappd.activityOnYou(goodbadResults("activityOnYou")); 

// Test foursquareVenueLookup
untappd.foursquareVenueLookup(goodbadResults("foursquareVenueLookup"),foursquare_id); 


