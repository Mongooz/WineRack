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
});