Router.configure({
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
	layoutTemplate: 'layout'
});

Router.map(function(){
    this.route('home', 
		{
			path: '/',
			template: 'home'
		});
    this.route('register', {path: '/register'});
	this.route('createwine', {path: '/create', data: function() {
			return Wines.findOne({_id: this.params.query.fromId});
		}});
	this.route('addtolist', {
		path: '/add/:_id', data: function() {
			return Wines.findOne({_id: this.params._id});
		}
	});
	this.route('cellar', {
		path: '/cellar', data: function() {
			return Cellars.find({user: Meteor.userId()}).fetch();
		}
	});
	this.route('rate', {
		path: '/rate/:_id',
		template: 'tastingnotes', 
		data: function() {
			return Wines.findOne({_id: this.params._id});
		}
	});
	this.route('viewtastingnotes', {
		path: '/rate/view/:_id',
		data: function() {
			return {_id: this.params._id, ratings: Ratings.find({wine: this.params._id}) };
		}
	});
});