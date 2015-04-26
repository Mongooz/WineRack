if (Meteor.isClient) {
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
				if (Session.get("friends")){
					var cellars = Cellars.find({wine: id}).map(function(it) { return it.user });
					if (cellars) {
						return Meteor.users.find({"services.facebook.id": { $in: Session.get("friends").map(function (it) { return it.id }) }, "_id": {$in: cellars }});
					}
				}
			}
		},
		friendsCellar: function(id) {
			if (id) {
				return Cellars.find({wine: id}).map(function(it) { return it.user });
			}
		}
    });
	
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