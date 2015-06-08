Wines = new Mongo.Collection("wines")
Wineries = new Mongo.Collection("wineries")
Cellars = new Mongo.Collection("cellars")
Ratings = new Mongo.Collection("ratings")

Meteor.methods({
	createWine: function(wine) {
		if (!Meteor.userId()) {
			throw Meteor.Error("The user is currently not authenticated. Please log in and try again.");
		}
		
		validateWine(wine, true);
		
		var wineryRecord = Wineries.findOne({name:wine.winery});
		var wineryId;
		if (!wineryRecord) {
			wineryId = Wineries.insert({name:wine.winery});
		} else {
			wineryId = wineryRecord._id;
		}
		
		var wineRecord = Wines.findOne({winery: wineryId, label: wine.label, vintage: wine.vintage});
		var wineId;
		if (!wineRecord) {
			wineId = encodeURI(wine.winery.replace(' ', '_') + '_' + wine.label.replace(' ', '_') + '_' + wine.vintage);
			Wines.insert({
				id: wineId,
				label: wine.label,
				vintage: wine.vintage,
				winery: wineryId});
		} else {
			wineId = wineRecord.id;
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
		
		validateCellar(details);		
		
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
	},
	
	updateWine: function(id, wine) {
		var inCellars = Cellars.find({wine: id});
		if (inCellars.count() > 1) {
			var error = "This wine is locked, as it is in use by someone else. Consider <a href='/create?fromId="+id+"'>creating a new wine</a> if this one is incorrect for your cellar.";
			Flash.danger(error);
			throw Meteor.Error(error);
		}
		
		validateWine(wine, false);
		
		Wines.update({_id: id}, {$set: {label: wine.label, vintage: wine.vintage}});
	},
	
	saveRating: function(id, rating, notes) {
		Ratings.insert({
			user: Meteor.userId(),
			wine: id,
			rating: rating,
			notes: notes
		});
	}
});

validateWine = function(wine, isNew) {
	if (!wine.label || !wine.vintage || (isNew && !wine.winery)) {
		throw Meteor.Error("A wine must have a winery, label and vintage.");
	}
	
	var vintage = parseInt(wine.vintage);
	if (!vintage) {
		throw Meteor.Error("Please select a valid vintage year.");
	}
	if (vintage - 1900 > new Date().getYear()) {
		throw Meteor.Error("If you have managed to retrieve a wine from the future, please also use the future version of this app.");
	}
	return true;
};

validateCellar = function(details) {
	if (!details.user || !details.wine) {
		throw Meteor.Error("Unable to add the wine to your cellar at this time.");
	}
	if (details.price && !parseFloat(details.price)) {
		throw Meteor.Error("Could not save as the price appears to be invalid.");
	}
	if (details.acquired && !(new Date(details.acquired))) {
		throw Meteor.Error("Could not save as the acquired date appears to be invalid.");
	}
	if (details.savedate && !(new Date(details.savedate))) {
		throw Meteor.Error("Could not save as the save for date appears to be invalid.");
	}
	return true;
};
