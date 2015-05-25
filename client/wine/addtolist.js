if (Meteor.isClient) {
	
	Template.addtolist.onRendered(function() {
		this.$('.pastDatePicker').datetimepicker( { format: "DD/MM/YYYY", maxDate: new Date() } );
		this.$('.futureDatePicker').datetimepicker( { format: "DD/MM/YYYY", minDate: new Date() } );
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
			
			var price;
			if (event.target.price) {
				price = event.target.price.value;
			}
            Meteor.call("addToList", {
                user: Meteor.userId(),
                wine: event.target.wineId.value,
				acquired: event.target.acquired.value,
				from: event.target.from.value,
				price: price,
				source: event.target.source.value,
				quantity: event.target.quantity.value,
				savedate: event.target.savedate.value
            });
			
			Router.go('home');
		}
    });
	
}