Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function() {
        return [Meteor.subscribe('notifications')]
    }
});

PostsListController = RouteController.extend({
    template: 'postsList',
    increment: 5,
    postsLimit: function() {
        return parseInt(this.params.postsLimit) || this.increment;
    },
    findOptions: function() {
        return {sort: this.sort, limit: this.postsLimit()};
    },
    subscriptions: function() {
        this.postsSub = Meteor.subscribe('posts', this.findOptions());
    },
    posts: function() {
        return Posts.find({}, this.findOptions());
    },
    data: function() {
        var hasMore = this.posts().count() === this.postsLimit();
        return {
            posts: this.posts(),
            ready: this.postsSub.ready,
            nextPath: hasMore ? this.nextPath() : null
        };
    }
});

NewPostsController = PostsListController.extend({
    sort: {submitted: -1, _id: -1},
    nextPath: function() {
        return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
    }
});

BestPostsController = PostsListController.extend({
    sort: {votes: -1, submitted: -1, _id: -1},
    nextPath: function() {
        return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
    }
});

Router.route('/', {
    name: 'home',
    controller: NewPostsController
});

Router.route('/websites', {name: 'websiteList'});

Router.route('/new/:postsLimit?', {name: 'newPosts'});

Router.route('/best/:postsLimit?', {name: 'bestPosts'});

Router.route('/posts/:_id', {
    name: 'postPage',
    waitOn: function() {
        return [
            Meteor.subscribe('singlePost', this.params._id),
            Meteor.subscribe('comments', this.params._id)
        ];
    },
    data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/posts/:_id/edit', {
    name: 'postEdit',
    waitOn: function() {
        return Meteor.subscribe('singlePost', this.params._id);
    },
    data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/submit', {
    name: 'postSubmit'
});

Router.route('/service/list/posts', {where: 'server'})
    .get(function() {
        this.response.writeHead(200, {'Content-Type': 'application/json'});
        var posts = Posts.find().fetch();
        this.response.end(JSON.stringify(posts));
    });

Router.route('/service/posts/:_id', {where: 'server'})
    .get(function() {
        this.response.writeHead(200, {'Content-Type': 'application/json'});
        this.response.end(JSON.stringify(Posts.findOne({_id: this.params._id})));
    })
    .put(function() {
        var scrape = this.request.body;
        var post = Posts.findOne({_id: this.params._id});
        post.updateScrape(scrape);
        console.log('Updated post id: ' + this.params._id + ' for url: ' + scrape.url);
        this.response.end('Successfully updated post id: ' + this.params._id);
    })
    .post(function() {

    });

var requireLogin = function() {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
};

Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});

