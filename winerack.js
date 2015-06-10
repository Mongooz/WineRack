Wines = new Mongo.Collection("wines");
Wineries = new Mongo.Collection("wineries");
Cellars = new Mongo.Collection("cellars");
Ratings = new Mongo.Collection("ratings");
SharedCellars = new Mongo.Collection("sharedCellars");

if (Meteor.isServer){
	Cellars.find({price: {$regex:'[$]'} }).fetch().map(function (it) { 
		Cellars.update(it._id, {$set: {price: it.price.substring(1)}});
		return it; 
	});
}

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
			if (!SharedCellars.findOne({cellar: details.user, user: Meteor.userId()})) {
				throw Meteor.Error("You do not have permission to add wines to this cellar.");
			}
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
	},
	
	shareCellar: function(toEmail) {
		check([toEmail], [String]);
		
		if (toEmail.length == 0) {  
			throw Meteor.Error("Email is required.");
		}
		if (toEmail.indexOf('@') < 0 || toEmail.indexOf('.') < 0) {
			throw Meteor.Error("The email is in an invalid format.");
		}
		
		var shareId = SharedCellars.insert({cellar: Meteor.userId()});
		
		if (Meteor.isServer) {
			// send and email with the link...
			var path = 'http://winerack.meteor.com' + Router.path('acceptsharedcellar', {id: shareId});
			this.unblock();
			
			var owner = Meteor.user().profile.name;
		    Email.send({
		      to: toEmail,
		      from: 'noreply@TheWineRack.Meteor.com',
		      subject: 'You\'ve been invited to join ' + owner + '\'s cellar',
			  html:
			  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>You\'ve been invited to join The Wine Rack</title><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body style="margin: 0; padding: 0;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;"><tr><td align="center" bgcolor="#ffffff" style="padding: 20px 0 20px 0;"><img src="http://winerack.meteor.com/ms-icon-150x150.png" alt="The Wine Rack" width="150" height="150" style="display: block;" /></td></tr><tr><td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px; color: black;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td> You\'ve been invited to join ' 
			  +owner+
			  '\'s cellar! </td></tr><tr><td style="padding: 20px 0 20px 0;">'
			  +owner+
			  'has generously allowed you full access to contribute to their cellar. </td></tr><tr><td style="padding: 20px 0 20px 0;"> After you\'ve created your account, you can accept the share by going to this unique link <a href="'
			  +path+
			  '">'
			  +path+
			  '</a>. </td></tr></table></td></tr><tr ><td bgcolor="#ffffff" style="padding: 30px 30px 30px 30px; color: black;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><td width="75%"> To get started, <a href="http://winerack.meteor.com">sign up for a free account</a>. </td><td align="right"></td></table></td></tr></table></td></tr></table></body></html>'
		    });
		}
	},
	
	acceptShare: function(id) {
		SharedCellars.update({_id: id}, {$set: {user: Meteor.userId()}});
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
