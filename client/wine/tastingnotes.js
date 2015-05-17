if (Meteor.isClient) {
	Template.tastingnotes.helpers({
		nameOf: function(id) {
			if (id) {
				var winery = Wineries.findOne(id);
				if (winery) {
					return winery.name;
				}
			}
		}
	});
	
	Template.tastingnotes.events({
		"submit form": function (event) {
            event.preventDefault();
			
            Meteor.call("saveRating", 
				event.target.wineId.value, 
				event.target.rating.value,
				event.target.notes.value,
				function(error, result) {
					Router.go('cellar');
				}
            );
		}
    });
	
	Template.viewtastingnotes.helpers({
		nameOf: function(id) {
			if (id)
				return Wineries.findOne(id).name;
		},
		userName: function(id) {
			if (id)
				return Meteor.users.findOne(id).profile.name;
		},
		getWine: function(id) {
			if (id)
				return Wines.findOne(id);
		},
		average: function(collection) {
			if (collection) {
				var sum = 0;
				var num = 0;
				$(collection.fetch()).each(function () {
					num++;
    				sum += parseInt(this.rating);
				});
				return sum / num;
			}
		}
	});
}