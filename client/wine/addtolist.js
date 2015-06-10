if (Meteor.isClient) {
	
	Template.addtolist.onRendered(function() {
		this.$('.pastDatePicker').datetimepicker( { format: "DD/MM/YYYY", maxDate: new Date() } );
		this.$('.futureDatePicker').datetimepicker( { format: "DD/MM/YYYY", minDate: new Date() } );
		
		if (Cellars.find({user: Meteor.userId()}).fetch().length == 0) {
			($("#cellar")[0].selectedIndex = "1");
		}
	});
	
	Template.addtolist.helpers({
		purchase: function() {
			var from = Session.get("from");
			if (from) return from == 1;
			return true;
		},
		gift: function() {
			return Session.get("from") == 2;
		},
		consumed: function() {
			return Session.get("consumed");
		},
		nameOf: function(id) {
			if (id) {
				var winery = Wineries.findOne(id);
				if (winery) {
					return winery.name;
				}
			}
		},
		sharedCellars: function() {
			return SharedCellars.find({user: Meteor.userId()}).fetch().map(function(it) { 
				return { id: it.cellar, title: Meteor.users.findOne({_id: it.cellar}).profile.name + "'s Cellar" }; 
			});
		}
	});
	
	Template.addtolist.events({
        "change #from": function (event) {
			Session.set("from", event.target.value)
		},
		"change #listtype": function (event) {
			Session.set("consumed", event.target.value == 1)
		},
		"submit form": function (event) {
            event.preventDefault();
			
			if (!validateForm()) return;
			
			var price;
			if (event.target.price) {
				price = event.target.price.value;
			}
			
			var userId = Meteor.userId();
			if (event.target.cellar && event.target.cellar.value) {
				userId = event.target.cellar.value; 
			}
			
            Meteor.call("addToList", {
                user: userId,
                wine: event.target.wineId.value,
				acquired: event.target.acquired.value,
				from: event.target.from.value,
				price: price,
				source: event.target.source.value,
				quantity: event.target.quantity.value,
				savedate: event.target.savedate.value
            }, function(err, data) {
				if (err)
					Flash.danger('Sorry, something went wrong while adding this wine to the cellar.');
				else
					Router.go('home');			
			});
		}
    });
	
}