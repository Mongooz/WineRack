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
		path: '/add/:id', data: function() {
			return Wines.findOne({id: this.params.id});
		}
	});
	this.route('cellar', {
		path: '/cellar', data: function() {
			return Cellars.find({user: Meteor.userId()}).fetch();
		}
	});
	this.route('rate', {
		path: '/rate/:id',
		template: 'tastingnotes', 
		data: function() {
			return Wines.findOne({id: this.params.id});
		}
	});
	this.route('viewtastingnotes', {
		path: '/rate/view/:id',
		data: function() {
			var wine = Wines.findOne({id: this.params.id});
			return {id: this.params.id, ratings: Ratings.find({wine: wine._id}) };
		}
	});
});