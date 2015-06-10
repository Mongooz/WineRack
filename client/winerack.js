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
				var cellars = Cellars.find({wine: id, user: {$ne: Meteor.userId()}}).map(function(it) { return it.user; });
				if (cellars) {
					return Meteor.users.find({"_id": {$in: cellars }});
				}
			}
		},
		friendsCellar: function(id) {
			if (id) {
				return Cellars.find({wine: id}).map(function(it) { return it.user; });
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
		},
		getCellarTitle: function(cellar) {
			if (cellar && cellar.length > 0) {
				var id = cellar[0].user;
				if (id == Meteor.userId()) {
					return "My Cellar";
				}
				var user = Meteor.users.findOne({_id: id});
				if (user) {
					return user.profile.name + '\'s Cellar';
				}
			}
		},
		users: function() {
			var users = Meteor.users.find({'services.facebook': {$exists: true}, _id: { $ne: Meteor.userId() }}).fetch();
			
			return users.map(function(it) {
				var shared = SharedCellars.findOne({user: it._id});
				return { services: it.services, profile: it.profile, shared: shared };
			});
		},
		isOwner: function(cellar) {
			if (cellar && cellar.length > 0) {
				var id = cellar[0].user;
				if (id == Meteor.userId()) {
					return true;
				}
				return false;
			}
			return false;
		}
    });
	
	Template.cellar.events({
		"click .takeFromCellar": function (event) {
            event.preventDefault();
			
			var qty = parseInt(this.quantity) - 1;
			Meteor.call("updateQuantity", this._id, qty);
			
			var wine = Wines.findOne({_id: this.wine});
			Flash.success('__default__', 'You have successfully removed a wine from your cellar! Would you like to <a href="'+ Router.path('rate', { id: wine.id }) + '">add tasting notes</a>?');
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
			
			if (validateModal()) {
				Meteor.call("updateWine", this._id, { label: label, vintage: vintage });
				$("#"+this._id).modal("hide");
			}
		},
		"click .share": function (event) {
			event.target.disabled = true;
			var container = $(event.target).parent();
			var toEmail = container.find('input[name=toEmail]')[0].value;
			
			if (toEmail.length == 0) {  
				Flash.danger("Please specify an email address.");
				return false;
			} else if (toEmail.indexOf('@') < 0 || toEmail.indexOf('.') < 0) {
				Flash.danger("The email is in an invalid format.");
				return false;
			}
			 
			Meteor.call("shareCellar", toEmail);
			
			Flash.success("The email has been sent. It may take a little while before it appears in your friend's inbox.");
			container.find('input[name=toEmail]')[0].val('');
			event.target.disabled = false;
		}
    });
	
	Template.friend.helpers({
		male: function(friend) {
			return (friend.services.facebook.gender == "male")
		}
	});
    
	Template.cellar.onRendered(function() {
		this.$('.pastYearPicker').datetimepicker( {
			format: "YYYY",
			viewMode: "years",
			maxDate: new Date()
		});
	});
  
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
	
	Template.nav.helpers({
		cellars: function() {
			return SharedCellars.find({user: Meteor.userId()}).fetch().map(function(it) {
				var user = Meteor.users.findOne({_id: it.cellar});
				if (user) {
					return {title: user.profile.name + '\'s Cellar', user: user._id };
				}
			});
		}
    });
}