//
// UntappdClient
// 
// By Glen R. Goodwin
// twitter: @areinet
//

var QS = require("querystring");
var HTTP = require("http");
var Crypto = require("crypto");
	
var UntappdClient = function(apikey,user,password,debug) {
	var that = this;

	var auth = (user && password)?user+":"+password:null;

	var get = function(path,params,callback) {
		if (params && params.constructor==="function" && !callback) callback = params,params = {};
		if (!params) params = {};

		var options = {
			host: 'api.untappd.com',
			port: 80,
			path: path,
			method: "GET"
		};

		if (auth) options.auth = auth;

		Object.keys(params).forEach(function(k){
			if (params[k]===undefined || params[k]===null) delete params[k]; 
		});

		params.key=apikey;
		if (params) options.path += "?"+QS.stringify(params);

		if (debug) console.log("node-untappd: get : "+options.path);
		if (debug && options.auth) console.log("              auth: "+options.auth);

		var request = HTTP.request(options,function(response){
			response.setEncoding("utf8");
			var data = "";
			response.on("data",function(incoming){
				if (debug) console.log("node-untappd: data: ",incoming.length);
				data += incoming;
			})
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
		request.end();
		return request;		
	};


	// Verify that a connection works

	that.verify = function(callback) {
		var request = get("/v3",null,function(response){
			callback.call(that,null,true);	
		});
		request.on("error",function(err){
			callback.call(that,err,null);
		});
	};

	// The FEEDS

	that.userFeed = function(callback,lookupUser,since,offset) {
		return get("/v3/user_feed",{
			user: lookupUser,
			since: since,
			offset: offset
		},callback);	
	};

	that.friendFeed = function(callback,since,offset) {
		return get("/v3/feed",{
			since: since,
			offset: offset
		},callback);	
	};

	that.pubFeed = function(callback,since,geolat,geolong,offset,radius) {
		return get("/v3/thepub",{
			since: since,
			geolat: geolat,
			geolng: geolong,
			offset: offset,
			radius: radius
		},callback);	
	};

	that.venueFeed = function(callback,venue_id,since,offset) {
		return get("/v3/venue_checkins",{
			venue_id: venue_id,
			since: since,
			offset: offset
		},callback);	
	};

	that.beerFeed = function(callback,beer_id,since,offset) {
		return get("/v3/beer_checkins",{
			bid: beer_id,
			since: since,
			offset: offset
		},callback);	
	};

	that.breweryFeed = function(callback,brewery_id,since,offset) {
		return get("/v3/brewery_checkins",{
			brewery_id: brewery_id,
			since: since,
			offset: offset
		},callback);	
	};

	// The INFO

	that.checkinInfo = function(callback,checkin_id) {
		return get("/v3/details",{
			id: checkin_id
		},callback);	
	};

	that.venueInfo = function(callback,venue_id) {
		return get("/v3/venue_info",{
			venue_id: venue_id
		},callback);	
	};

	that.beerInfo = function(callback,beer_id) {
		return get("/v3/beer_info",{
			bid: beer_id
		},callback);	
	};

	that.brewerInfo = function(callback,brewery_id) {
		return get("/v3/brewery_info",{
			brewery_id: brewery_id
		},callback);	
	};

	// USER Related Calls

	that.userInfo = function(callback,lookupUser) {
		return get("/v3/user",{
			user: lookupUser
		},callback);	
	};

	that.userBadges = function(callback,lookupUser) {
		return get("/v3/user_badge",{
			user: lookupUser
		},callback);	
	};

	that.userFriends = function(callback,lookupUser) {
		return get("/v3/friends",{
			user: lookupUser
		},callback);	
	};

	that.userWishList = function(callback,lookupUser,offset) {
		return get("/v3/wish_list",{
			user: lookupUser,
			offset: offset
		},callback);	
	};

	that.userDistinctBeers = function(callback,lookupUser,offset) {
		return get("/v3/user_distinct",{
			user: lookupUser,
			offset: offset
		},callback);	
	};

	// CHECKIN calls

	that.checkinTest = function(callback,gmt_timestamp,beer_id,foursquare_id,user_lat,user_long) {
		return get("/v3/checkin_test",{
			gmt_offset: gmt_timestamp,
			bid: beer_id,
			foursquare_id: foursquare_id,
			user_lat: user_lat,
			user_lng: user_long
		},callback);	
	};

	that.checkin = function(callback,gmt_timestamp,beer_id,foursquare_id,user_lat,user_long,comment,rating,facebook,twitter,foursqaure,gowalla) {
		return get("/v3/checkin",{
			gmt_offset: gmt_timestamp,
			bid: beer_id,
			foursquare_id: foursquare_id,
			user_lat: user_lat,
			user_lng: user_long,
			shout: comment,
			rating_value: rating?rating|0:null,
			facebook: facebook?"on":"off",
			twitter: twitter?"on":"off",
			foursquare: foursquare?"on":"off",
			gowalla: gowalla?"on":"off"
		},callback);	
	};

	that.addComment = function(callback,checkin_id,comment) {
		return get("/v3/add_comment",{
			checkin_id: checkin_id,
			comment: comment
		},callback);	
	};

	that.removeComment = function(callback,checkin_id) {
		return get("/v3/delete_comment",{
			checkin_id: checkin_id
		},callback);	
	};

	that.toast = function(callback,checkin_id) {
		return get("/v3/toast",{
			checkin_id: checkin_id
		},callback);	
	};

	that.removeToast = function(callback,checkin_id) {
		return get("/v3/delete_toast",{
			checkin_id: checkin_id
		},callback);	
	};

	// WISH LIST calls

	that.addToWishList = function(callback,beer_id) {
		return get("/v3/add_to_wish",{
			bid: beer_id
		},callback);	
	};

	that.removeFromWishList = function(callback,beer_id) {
		return get("/v3/remove_from_wish",{
			bid: beer_id
		},callback);	
	};

	// FRIEND management

	that.pendingFriends = function(callback) {
		return get("/v3/friend_pending",{
		},callback);	
	};

	that.acceptFriends = function(callback,target_id) {
		return get("/v3/friend_accept",{
			target_id: target_id
		},callback);	
	};

	that.rejectFriends = function(callback,target_id) {
		return get("/v3/friend_reject",{
			target_id: target_id
		},callback);	
	};

	that.removeFriends = function(callback,target_id) {
		return get("/v3/friend_revoke",{
			target_id: target_id
		},callback);	
	};

	that.requestFriends = function(callback,target_id) {
		return get("/v3/friend_request",{
			target_id: target_id
		},callback);	
	};

	// ACTIVITY ON YOU calls

	that.activityOnYou = function(callback,since) {
		return get("/v3/activity_on_you",{
			since: since
		},callback);	
	};

	// FOURSQUARE conversion

	that.foursquareVenueLookup = function(callback,foursquare_id) {
		return get("/v3/foursquare_lookup",{
			vid: foursquare_id
		},callback);	
	};
		
};


module.exports = UntappdClient;

