node-untappd
-------
NodeJS API to intergrate with [Untappd API](http://untappd.com/api/docs/v3).

[Untappd](http://untappd.com) is a social beer tracking application for most mobile devices and the greater internet at large.  It supports a robust set of features for "checking into" beer as it is consumed including locations, ratings, comments, and social integration.

This library provides NodeJS with an abstraction to the [Untappd API](http://untappd.com/api/docs/v3) allowing developers to query and integrate Untappd services into their own applications.

This library nor the authors have any formal relationship with Untappd other than the beer we drink.

## Build Status

[![Build Status](https://secure.travis-ci.org/arei/node-untappd.png)](http://travis-ci.org/arei/node-untappd)

## Getting Started

 1. If you have never done so, sign up for [Untappd](http://untappd.com) and download it to your favorite mobile device.
 2. Have a nice craft beer and make sure to Checkin.
 3. You need to get yourself an Untappd ClientID and ClientSecret.  To do so, go complete the [Untappd API Key Form](http://untappd.com/api/register?register=new).
 4. Have more nice craft beer, make more checkins.
 5. Wait for Untappd to email you your key.  This takes around two (2) business days.
 6. Download node-untappd: `npm install node-untappd`
 7. Look at the Example, beer is optional but encouraged.

## Access Tokens

Untappd now support OAUTH for most operations and specifically for any operation that writes data to untappd.  

To get an Access Token, you can use our hand OAUTH URL call to get the untappd oauth url, and then use that to get the access token.  For moreinformation on getting access token, please refer to [Untappd's API Authnetication page](http://untappd.com/api/docs/v4#authentication).

## The Example code

The `Example.js` file provides a very simple example for working with UntappdClient.

To use Example.js...

 1. Set your CLIENT ID on line 12.
 2. Set your CLIENT SECRET on line 15.

To run the example:

	node Example.js

## Basic Usage

There are four parts to using node-untappd:

Import the library:
 
	var UntappdClient = require("node-untappd");
 
Creating the client:
 
	var debug = false;
	var untappd = new UntappdClient(debug);

Set your credientials

	var clientId = "[ your api key goes here ]"; // Replace this with your CLIENT ID
	var clientSecret = "[ your client secret goes here ]"; // Replace this with your CLIENT SECRET
	var accessToken = "[ your access token goes here ]"; // Replace this with an Access Token, Optional

	untappd.setClientId(clientId);
	untappd.setClientSecret(clientSecret);
	untappd.setAccessToken(accessToken); // Optional
 		
Executing API calls, for example:
 
 	var lookupuser = "[ some user name ]";
	untappd.userFeed(function(err,obj){
		var beers = obj.results.forEach(function(checkin){
			console.log("\n"+username,"drank",checkin.beer_name);
			console.log("by",checkin.brewery_name);
			if (checkin.venue_name) console.log("at",checkin.venue_name);
			console.log("on",checkin.created_at);
		});
	},lookupuser);

## API Calls

All of the API calls defined in the [Untappd API](http://untappd.com/api/docs/v3) have been implemented into the UntappdClient.  It's a long list, so please look at UntappdClient for usage.

Each API call takes a callback function as it's first argument.  Upon an result this function is called with `err` as the first parameter and `obj`, an object of the results, as the second.  

	function(err,obj)
	
The `err` is only populated if an error occurs, otherwise it is null.

The `obj` will be populated with the object returned from Untappd upon completion of the call.  In some cases where an error occurs, both `err` and `obj` will be populated.

## Going beyond the API

We are providing only the most basic API.  Please use it and take it to strange and wonderful new places.  Also, please share what you have done with us, any suggestions you have with us, and by all means any bugs you find with us.  We are eager to hear from you and, more importantly, score free beer from you.

## Examples of Usage

Below is a list of sites where you can see node-untappd in production use.  

 * http://www.arei.net - arei's website which shows the last beer he drank in the upper right corner.

If you are using node-untappd somewhere in production, I'd love to share it out.  Please let me know!
