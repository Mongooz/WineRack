Router.configure({
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
	layoutTemplate: 'layout'
});

Router.onRun(function(pause) {
      if (!Meteor.userId()) {       
        Router.go('landing');
      }
	  return pause();
    }, { except: ['landing'] }
);

Router.map(function(){
	this.route('landing',
		{
			path: '/'
		});
    this.route('home', 
		{
			path: '/list',
			template: 'winelist'
		});
	this.route('createwine', {path: '/create'});
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