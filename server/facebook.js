Meteor.methods({
	fetchFromService: function(token) {
		var url = "https://graph.facebook.com/v2.3/me/friends?access_token="+token;
		//synchronous GET
		var result = Meteor.http.get(url, {timeout:30000});
		if(result.statusCode==200) {
			return JSON.parse(result.content);
		} else {
			console.log("Response issue: ", result.statusCode);
			var errorJson = JSON.parse(result.content);
			throw new Meteor.Error(result.statusCode, errorJson.error);
		}
	}
});