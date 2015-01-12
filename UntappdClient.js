//
// UntappdClient v4
//
// By Glen R. Goodwin
// twitter: @areinet
//

var QS = require("querystring");
var HTTP = require("http");
var Crypto = require("crypto");

var UntappdClient = function(debug) {
	var that = this;

	var id,secret,token;

	var setClientId = function(clientId) {
		id = clientId;
		return that;
	};
	this.setClientId = setClientId;

	var getClientId = function() {
		return id;
	};
	this.getClientId = getClientId;

	var setClientSecret = function(clientSecret) {
		secret = clientSecret;
		return that;
	};
	this.setClientSecret = setClientSecret;

	var getClientSecret = function() {
		return secret;
	};
	this.getClientSecret = getClientSecret;

	var setAccessToken = function(accessToken) {
		token = accessToken;
		return that;
	};
	this.setAccessToken = setAccessToken;

	var getAccessToken = function() {
		return token;
	};
	this.getAccessToken = getAccessToken;

	var post = function(path, params, data, callback){
		return req("POST",path,params,data,callback);
	};

	var get = function(path, params, callback){
		return req("GET",path,params,null,callback);
	};

	var req = function(method, path, params, data, callback) {
		if (params && params.constructor==="function" && !callback) {
			callback = params;
			params = {};
		}
		if (!params) params = {};

		var options = {
			host: 'api.untappd.com',
			port: 443,
			path: path,
			method: method
		};

		if (method == "POST") {
			data = QS.stringify(data);
			options.headers = {
				"Content-Type":"application/x-www-form-urlencoded",
				"Content-Length":data.length
			};
		}

		Object.keys(params).forEach(function(k) {
			if (params[k]===undefined || params[k]===null) delete params[k];
		});

		if (id) params.client_id = id;
		if (secret) params.client_secret = secret;
		if (token) params.access_token = token;

		if (params) options.path += "?"+QS.stringify(params);

		if (debug) console.log("node-untappd: get : "+options.path);

		if(debug){
			console.log(params);
			console.log(data);
		}

		var request = HTTP.request(options,function(response){
			response.setEncoding("utf8");
			var data = "";
			response.on("data",function(incoming){
				if (debug) console.log("node-untappd: data: ",incoming.length);
				data += incoming;
			});
			response.on("end",function(incoming){
				if (debug) console.log("node-untappd: end: ",incoming?incoming.length:0);
				data += incoming?incoming:"";
				var obj = JSON.parse(data);
				callback.call(that,null,obj);
			});
			response.on("error",function(){
				if (debug) console.log("node-untappd: error: ",arguments);
				callback.call(that,arguments,null);
			});
		});
		request.on("error",function(){
			if (debug) console.log("node-untappd: error: ",arguments);
			callback.call(that,arguments,null);
		});
		if(method=="POST"){
			request.write(data);
		}
		request.end();
		return request;
	};

	var hasToken = function() {
		return !!token;
	};

	var hasId = function() {
		return !!id;
	};

	var hasSecret = function() {
		return !!secret;
	};

	// Verify that a connection works

	that.verify = function(callback) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		var request = get("/v4",null,function(response){
			callback.call(that,null,true);
		});
		request.on("error",function(err){
			callback.call(that,err,null);
		});
	};

	// OAUTH Stuff

	// We use the basic oauth redirect method from untappd.
	// this url can be used in the browser to get the access token
	that.getUserAuthenticationURL = function(returnRedirectionURL) {
		if (returnRedirectionURL===undefined || returnRedirectionURL===null) throw new Error("returnRedirectionURL cannot be undefined or null.");
		if (!hasId() || !hasSecret()) throw new Error("UntappdClient.getUserAuthenticationURL requires a ClientId/ClientSecret pair.");
		return "https://untappd.com/oauth/authenticate/?client_id="+id+"&response_type=token&redirect_url="+returnRedirectionURL;
	};

	//this is for server-side, Step 1 - OAUTH Authentication
	that.getAuthenticationURL = function(returnRedirectionURL){
		if (returnRedirectionURL===undefined || returnRedirectionURL===null) throw new Error("returnRedirectionURL cannot be undefined or null.");
		if (!hasId() || !hasSecret()) throw new Error("UntappdClient.getUserAuthenticationURL requires a ClientId/ClientSecret pair.");
		return 'https://untappd.com/oauth/authenticate/?client_id='+id+'&client_secret='+secret+'&response_type=code&redirect_url='+returnRedirectionURL+'&code=COD';
	};

	// Step 2 - OATUH Authorization
	that.getAuthorizationURL = function(returnRedirectionURL,code){
		if (returnRedirectionURL===undefined || returnRedirectionURL===null) throw new Error("returnRedirectionURL cannot be undefined or null.");
		if (!hasId() || !hasSecret()) throw new Error("UntappdClient.getUserAuthenticationURL requires a ClientId/ClientSecret pair.");
		return 'https://untappd.com/oauth/authorize/?client_id='+id+'&client_secret='+secret+'&response_type=code&redirect_url='+returnRedirectionURL+'&code='+code;
	};

	// The FEEDS

	that.friendFeed = function(callback,limit,offset) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.friendFeed requires an AccessToken.");
		return get("/v4/checkin/recent",{
			limit: limit,
			offset: offset
		},callback);
	};

	that.userFeed = function(callback,lookupUser,limit,max_id) {
		if (lookupUser===undefined || lookupUser===null) throw new Error("lookupUser cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.userFeed requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/user/checkins/"+lookupUser,{
			limit: limit,
			max_id: max_id
		},callback);
	};

	that.pubFeed = function(callback,since,geolat,geolong,radius,limit,offset) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.pubFeed requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/thepub",{
			since: since,
			geolat: geolat,
			geolng: geolong,
			radius: radius,
			offset: offset,
			limit: limit
		},callback);
	};

	that.venueFeed = function(callback,venue_id,since,limit,offset) {
		if (venue_id===undefined || venue_id===null) throw new Error("venue_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.venueFeed requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/venue/checkins/"+venue_id,{
			since: since,
			limit: limit,
			offset: offset
		},callback);
	};

	that.beerFeed = function(callback,beer_id,since,limit,offset) {
		if (beer_id===undefined || beer_id===null) throw new Error("beer_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.beerFeed requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/beer/checkins/"+beer_id,{
			since: since,
			limit: limit,
			offset: offset
		},callback);
	};

	that.breweryFeed = function(callback,brewery_id,since,limit,offset) {
		if (brewery_id===undefined || brewery_id===null) throw new Error("brewery_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.breweryFeed requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/brewery/checkins/"+brewery_id,{
			since: since,
			limit: limit,
			offset: offset
		},callback);
	};

	// The INFO

	that.checkinInfo = function(callback,checkin_id) {
		if (checkin_id===undefined || checkin_id===null) throw new Error("checkin_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.checkinInfo requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/checkin/view/"+checkin_id,{
		},callback);
	};

	that.venueInfo = function(callback,venue_id) {
		if (venue_id===undefined || venue_id===null) throw new Error("venue_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.venueInfo requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/venue/info/"+venue_id,{
		},callback);
	};

	that.beerInfo = function(callback,beer_id) {
		if (beer_id===undefined || beer_id===null) throw new Error("beer_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.beerInfo requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/beer/info/"+beer_id,{
		},callback);
	};

	that.brewerInfo = function(callback,brewery_id) {
		if (brewery_id===undefined || brewery_id===null) throw new Error("brewery_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.brewerInfo requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/brewery/info/"+brewery_id,{
		},callback);
	};

	// USER Related Calls

	that.userInfo = function(callback,lookupUser) {
		if (lookupUser===undefined || lookupUser===null) throw new Error("lookupUser cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.userInfo requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/user/info/"+lookupUser,{
		},callback);
	};

	that.userBadges = function(callback,lookupUser,offset) {
		if (lookupUser===undefined || lookupUser===null) throw new Error("lookupUser cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.userBadges requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/user/badges/"+lookupUser,{
			offset: offset
		},callback);
	};

	that.userFriends = function(callback,lookupUser,limit,offset) {
		if (lookupUser===undefined || lookupUser===null) throw new Error("lookupUser cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.userFriends requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/user/friends/"+lookupUser,{
			limit: limit,
			offset: offset
		},callback);
	};

	that.userWishList = function(callback,lookupUser,offset) {
		if (lookupUser===undefined || lookupUser===null) throw new Error("lookupUser cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.userWishList requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/user/wishlist/"+lookupUser,{
			offset: offset
		},callback);
	};

	that.userDistinctBeers = function(callback,lookupUser,sort,offset) {
		if (lookupUser===undefined || lookupUser===null) throw new Error("lookupUser cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.userDistinctBeers requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/user/beers/"+lookupUser,{
			sort: sort,
			offset: offset
		},callback);
	};

	// SEARCH calls
	this.searchBrewery = function(callback,searchTerms) {
		if (searchTerms===undefined || searchTerms===null) throw new Error("searchTerms cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.searchBrewery requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/search/brewery",{
			q: searchTerms
		},callback);
	};

	this.searchBeer = function(callback,searchTerms,sort) {
		if (searchTerms===undefined || searchTerms===null) throw new Error("searchTerms cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.searchBeer requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/search/beer",{
			q: searchTerms,
			sort: sort
		},callback);
	};

	this.trending = function(callback) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.trending requires an AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/beer/trending",{
		},callback);
	};

	// CHECKIN calls

	that.checkin = function(callback,gmt_offset,timezone,beer_id,foursquare_id,user_lat,user_long,comment,rating,facebook,twitter,foursquare,gowalla) {
		if (gmt_offset===undefined || gmt_offset===null) throw new Error("gmt_offset cannot be undefined or null.");
		if (timezone===undefined || timezone===null) throw new Error("timezone cannot be undefined or null.");
		if (beer_id===undefined || beer_id===null) throw new Error("beer_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.checkin requires an AccessToken.");
		return post("/v4/checkin/add",{},{
			gmt_offset: gmt_offset,
			timezone: timezone,
			bid: beer_id,
			foursquare_id: foursquare_id,
			geolat: user_lat,
			geolng: user_long,
			shout: comment,
			rating: rating?Math.max(1,Math.min(5,rating|0)):null,
			facebook: facebook?"on":"off",
			twitter: twitter?"on":"off",
			foursquare: foursquare?"on":"off"
		},callback);
	};

	that.addComment = function(callback,checkin_id,comment) {
		if (checkin_id===undefined || checkin_id===null) throw new Error("checkin_id cannot be undefined or null.");
		if (comment===undefined || comment===null) throw new Error("comment cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.addComment requires an AccessToken.");
		return post("/v4/checkin/addcomment/"+checkin_id,{},{
			comment: comment.substring(0,140)
		},callback);
	};

	that.removeComment = function(callback,comment_id) {
		if (comment_id===undefined || comment_id===null) throw new Error("comment_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.removeComment requires an AccessToken.");
		return post("/v4//checkin/deletecomment"+comment_id,{},{
		},callback);
	};

	// If already toasted, this will untoast, otherwise it toasts.
	that.toggleToast = function(callback,checkin_id) {
		if (comment_id===undefined || comment_id===null) throw new Error("comment_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.toast requires an AccessToken.");
		return get("/v4/checkin/toast"+checkin_id,{
		},callback);
	};

	// WISH LIST calls

	that.addToWishList = function(callback,beer_id) {
		if (beer_id===undefined || beer_id===null) throw new Error("beer_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.addToWishList requires an AccessToken.");
		return get("/v4/user/wishlist/add",{
			bid: beer_id
		},callback);
	};

	that.removeFromWishList = function(callback,beer_id) {
		if (beer_id===undefined || beer_id===null) throw new Error("beer_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.removeFromWishList requires an AccessToken.");
		return get("/v4/user/wishlist/remove",{
			bid: beer_id
		},callback);
	};

	// FRIEND management

	that.pendingFriends = function(callback) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.pendingFriends requires an AccessToken.");
		return get("/v4/user/pending",{
		},callback);
	};

	that.acceptFriends = function(callback,target_id) {
		if (target_id===undefined || target_id===null) throw new Error("target_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.acceptFriends requires an AccessToken.");
		return post("/v4/friend/accept/"+target_id,{},{
		},callback);
	};

	that.rejectFriends = function(callback,target_id) {
		if (target_id===undefined || target_id===null) throw new Error("target_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.rejectFriends requires an AccessToken.");
		return post("/v4/friend/reject/"+target_id,{},{
		},callback);
	};

	that.removeFriends = function(callback,target_id) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (target_id===undefined || target_id===null) throw new Error("target_id cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.removeFriends requires an AccessToken.");
		return get("/v4/friend/remove/"+target_id,{
		},callback);
	};

	that.requestFriends = function(callback,target_id) {
		if (target_id===undefined || target_id===null) throw new Error("target_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.requestFriends requires an AccessToken.");
		return get("/v4/friend/request/"+target_id,{
		},callback);
	};

	// NOTIFICATION calls

	that.notifications = function(callback) {
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!hasToken()) throw new Error("UntappdClient.notifications requires an AccessToken.");
		return get("/v4/notifications",{
		},callback);
	};

	// FOURSQUARE conversion

	that.foursquareVenueLookup = function(callback,foursquare_id) {
		if (foursquare_id===undefined || foursquare_id===null) throw new Error("foursquare_id cannot be undefined or null.");
		if (callback===undefined || callback===null) throw new Error("callback cannot be undefined or null.");
		if (!(hasToken() || (hasId() && hasSecret()))) throw new Error("UntappdClient.foursquareVenueLookup requires and AccessToken or a ClientId/ClientSecret pair.");
		return get("/v4/venue/foursquare_lookup/"+foursquare_id,{
		},callback);
	};

};

module.exports = UntappdClient;

