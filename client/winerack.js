if (Meteor.isClient) {
	Accounts.ui.config({
	  requestPermissions: {
	    facebook: ['user_friends']
	  }
	});
	
	Template.winelist.helpers({
		wines: function () {
            return Wines.find({});
        },
		nameOf: function(id) {
			if (id)
				return Wineries.findOne(id).name;
		},
		inCellar: function(id) {
			if (id)
				return Cellars.findOne({wine: id, user: Meteor.userId()});
		},
		inFriendsCellar: function(id) {
			if (id) {
				var cellars = Cellars.find({wine: id, user: {$ne: Meteor.userId()}}).map(function(it) { return it.user });
				if (cellars) {
					return Meteor.users.find({"_id": {$in: cellars }});
				}
			}
		},
		friendsCellar: function(id) {
			if (id) {
				return Cellars.find({wine: id}).map(function(it) { return it.user });
			}
		}
    });
	
	Template.ratings.helpers({
		ratingCount: function(id) {
			if (id) {
				return Ratings.find({wine: id}).count();
			}
		}
	})
	
	Template.cellar.helpers({
		nameOf: function(id) {
			if (id)
				return Wineries.findOne(id).name;
		},
		getWine: function(id) {
			if (id)
				return Wines.findOne(id);
		},
		fromName: function(from) {
			if (from == 2)
				return "Gift";
			return "Purchase";
		}
    });
	
	Template.cellar.events({
		"click .takeFromCellar": function (event) {
            event.preventDefault();
			
			var qty = parseInt(this.quantity) - 1;
			Meteor.call("updateQuantity", this._id, qty);
		},
		"click .addToCellar": function (event) {
            event.preventDefault();
			
			var qty = parseInt(this.quantity) + 1;
			Meteor.call("updateQuantity", this._id, qty);
		},
		"click .update": function (event) {
			var container = $(event.target).parents('.modal-content');
			var label = container.find('input[name=label]')[0].value;
			var vintage = container.find('input[name=vintage]')[0].value;
			
			Meteor.call("updateWine", this._id, { label: label, vintage: vintage });
		},
    });
	
	Template.friend.helpers({
		male: function(friend) {
			return (friend.services.facebook.gender == "male")
		}
	});
    
	Template.createwine.rendered = function() {
	  Meteor.typeahead.inject();
	};
  
  Template.winelist.events({
	'click #btn-create-wine' : function(e, t) {
		e.preventDefault();
		Router.go('createwine');
		return false;
    }
  });
  
	
	Template.winelist.rendered = function() {
		var token = Meteor.user().services.facebook.accessToken;
		Meteor.call('fetchFromService', token, function(err, respJson) {
			if(err) {
				console.log("error occurred on receiving data on server. ", err );
			} else {
				Session.set("friends", respJson.data);
			}
		});
	};
}