node-untappd
-------
NodeJS API to intergrate with [Untappd API](http://untappd.com/api/docs/v3).

[Untappd](http://untappd.com) is a social beer tracking application for most mobile devices and the greater internet at large.  It supports a robust set of features for "checking into" beer as it is consumed including locations, ratings, comments, and social integration.

This library provides NodeJS with an abstraction to the [Untappd API](http://untappd.com/api/docs/v3) allowing developers to query and integrate Untappd services into their own applications.

This library nor the authors have any formal relationship with Untappd other than the beer we drink.

## Getting Started

 1. If you have never done so, sign up for [Untappd](http://untappd.com) and download it to your favorite mobile device.
 2. Have a nice craft beer and make sure to Checkin.
 3. You need to get yourself an Untappd API Key.  To do so, go complete the [Untappd API Key Form](http://untappd.com/api/register?register=new).
 4. Have more nice craft beer, make more checkins.
 5. Wait for Untappd to email you your key.  This takes around two (2) business days.
 6. Download node-untappd.
 7. Look at the Example, beer is optional but encouraged.

## The Example code

The `Example.js` file provides a very simple example for working with UntappdClient.

To use Example.js...

 1. Set your API KEY on line 13.
 2. Set your USERNAME on line 16.
 3. Set your PASSWORD on line 25. **Make sure to read the comments and the section below about authentication first!**
 4. Run the example:

    node Example.js

## Basic Usage

There are three parts to using node-untappd:

 1. Import the library:
 
	var UntappdClient = require("UntappdClient.js");
 
 2. Creating the client:
 
	var apikey = "[ your api key goes here ]";
	var username = null; // replace with a valid username if you want an authenticated usage.
	var password = null; // replace with a valid hex encode, MD5 password if you want an authenticated usage.
	var debug = false;
	var untappd = new UntappdClient(apikey,username,password,debug);
 		
 3. Executing API calls, for example:
 
 	untappd.userFeed(function(err,obj){
		var beers = obj.results.forEach(function(checkin){
			console.log("\n"+username,"drank",checkin.beer_name);
			console.log("by",checkin.brewery_name);
			if (checkin.venue_name) console.log("at",checkin.venue_name);
			console.log("on",checkin.created_at);
		});
	},lookupuser);

## About Authentication

Some of the API calls require an authenticated user, while some do not.  In those cases where it is required, simply supply a username and password when constructing UntappdClient following the API Key as shown here:

	var untappd = new UntappdClient(apikey,username,password,debug);

The username should be a simple String. 

The password should be a hex encode, MD5 hash.  To make a hex encode, MD5 hash do the following:

	node
	> require("crypto").createHash("md5").update("password").digest("hex");

Replace "password" with the password you want to use.  The outputted string is your MD5 hash which you can then put into your code.

## API Calls

All of the API calls defined in the [Untappd API](http://untappd.com/api/docs/v3) have been implemented into the UntappdClient.  It's a long list, so please look at UntappdClient for usage.

Each API call takes a callback function as it's first argument.  Upon an result this function is called with `err` as the first parameter and `obj`, an object of the results, as the second.  

	function(err,obj)
	
The `err` is only populated if an error occurs, otherwise it is null.

The `obj` will be populated with the object returned from Untappd upon completion of the call.  In some cases where an error occurs, both `err` and `obj` will be populated.

## Going beyond the API

We are providing only the most basic API.  Please use it and take it to strange and wonderful new places.  Also, please share what you have done with us, any suggestions you have with us, and by all means any bugs you find with us.  We are eager to hear from you and, more importantly, score free beer from you.
