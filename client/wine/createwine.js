if (Meteor.isClient) {
	Template.createwine.events({
        "submit form": function (event) {
            event.preventDefault();
			var wineryRecord = Wineries.findOne({name:event.target.winery.value});
			var wineryId;
			if (!wineryRecord) {
				wineryId = Wineries.insert({name:event.target.winery.value});
			} else {
				wineryId = wineryRecord._id;
			}
			
			var wineRecord = Wines.findOne({winery: wineryId, name: event.target.label.value, vintage: event.target.vintage.value});
			var wineId;
			if (!wineRecord) {
				wineId = Wines.insert({
                label: event.target.label.value,
                vintage: event.target.vintage.value,
                winery: wineryId});
			} else {
				wineId = wineRecord._id;
			}
            
			Router.go('addtolist', {_id: wineId});
		},
		"change #from": function (event) {
			Session.set("from", event.target.value)
		},
		"change #listtype": function (event) {
			Session.set("consumed", event.target.value == 1)
		},
		"blur #winery": function (event) {
			var winery = Wineries.findOne({name:event.target.value})
			if (winery) {
				Session.set("winery", winery._id);
			}
		}
    });

	Template.createwine.onRendered(function() {
		this.$('.pastYearPicker').datetimepicker( {
			format: "YYYY",
			viewMode: "years",
			maxDate: new Date()
		});
		this.$('.pastDateTimePicker').datetimepicker( { format: "DD/MM/YYYY", maxDate: new Date() } );
		this.$('.futureDateTimePicker').datetimepicker( { format: "DD/MM/YYYY", minDate: new Date() } );
	});
		
	Template.createwine.helpers({
		wineries: function() {
			return Wineries.find().fetch().map(function(winery){ return winery.name; });
		},
		wines: function() {
			var wineryId = Session.get("winery");
			if (wineryId) {
				return Wines.find({winery: wineryId}).fetch().map(function(wine){ return wine.label; });
			}
		},
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
		}
	});
}