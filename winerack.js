Wines = new Mongo.Collection("wines")
Wineries = new Mongo.Collection("wineries")
Cellars = new Mongo.Collection("cellars")

Meteor.methods({
	createWine: function(wine) {
		if (!Meteor.userId()) {
			throw Meteor.Error("The user is currently not authenticated. Please log in and try again.");
		}
		
		var wineryRecord = Wineries.findOne({name:wine.winery});
		var wineryId;
		if (!wineryRecord) {
			wineryId = Wineries.insert({name:wine.winery});
		} else {
			wineryId = wineryRecord._id;
		}
		
		var wineRecord = Wines.findOne({winery: wineryId, name: wine.label, vintage: wine.vintage});
		var wineId;
		if (!wineRecord) {
			wineId = Wines.insert({
				label: wine.label,
				vintage: wine.vintage,
				winery: wineryId});
		} else {
			wineId = wineRecord._id;
		}
		
		return wineId;
	},
	
	addToList: function(details) {
		if (!Meteor.userId()) {
			throw Meteor.Error("You are currently not authenticated. Please log in and try again.");
		}
		
		if (details.user != Meteor.userId()){
			throw Meteor.Error("You may only manage your own cellar. This feature will be added in a future update.");
		}
		
		Cellars.insert({
			user: details.user,
			wine: details.wine,
			acquired: details.acquired,
			from: details.from,
			price: details.price,
			source: details.source,
			quantity: details.quantity,
			savedate: details.savedate
		});
	},
	
	updateQuantity: function (id, quantity) {
		if (!quantity || quantity < 0) {
			Cellars.remove(id);
		} else {
			Cellars.update({_id: id}, {$set: {quantity: quantity}});
		}
	}
})