	Template.acceptsharedcellar.onRendered(function() {
		if (Meteor.userId()) {		
			Meteor.call("acceptShare", this.data.id);
			
			var cellar = SharedCellars.findOne({_id: this.data.id});
			if (cellar) {
				Router.go('sharedcellar', {id: cellar.cellar});
			} else {
				Router.go('home');
			}
		}
	});
	
	Template.acceptsharedcellar.helpers({
		acceptShare: function () {
			if (Meteor.userId()) {		
				Meteor.call("acceptShare", this.id);
				
				var cellar = SharedCellars.findOne({_id: this.id});
				if (cellar) {
					Router.go('sharedcellar', {id: cellar.cellar});
				} else {
					Router.go('home');
				}
			}
        },
		expired: function() {
			var cellar = SharedCellars.findOne({_id: this.id});
			if (cellar.user) {
				if (cellar.user == Meteor.userId())
					Router.go('sharedcellar', {id: cellar.cellar});
				return true;
			}
			return false;
		}
	});