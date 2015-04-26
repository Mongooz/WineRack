if (Meteor.isClient) {
	
	Template.addtolist.onRendered(function() {
		this.$('.datetimepicker').datetimepicker( { format: "DD/MM/YYYY" } );
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
			
            Cellars.insert({
                user: Meteor.userId(),
                wine: event.target.wineId.value,
				acquired: event.target.acquired.value,
				from: event.target.from.value,
				price: event.target.price.value,
				source: event.target.source.value,
				savedate: event.target.savedate.value
            });
			
			Router.go('home');
		}
    });
	
}