Wines = new Mongo.Collection("wines")
Wineries = new Mongo.Collection("wineries")
Cellars = new Mongo.Collection("cellars")

// Temporary - migrate to use friendly IDs
var w = Wines.find({  }).fetch();
for (i=0;i<w.length;i++) {
	var wineryRecord = Wineries.findOne({_id:w[i].winery});
	var id = encodeURI(wineryRecord.name.replace(/[ ]/g, '_') + '_' + w[i].label.replace(/[ ]/g, '_') + '_' + w[i].vintage);
	Wines.update({_id: w[i]._id}, {$set: {id:id}});
}

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
		
		Wines.update({_id: id}, {$set: {label: wine.label, vintage: wine.vintage}});
	}
})