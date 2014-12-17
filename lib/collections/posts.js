Posts = new Mongo.Collection('posts',
    {
        transform: function(entry) {
            entry.updateScrape = function(msg) {
                if (typeof this.scrapeHistory === 'undefined') {
                    this.scrapeHistory = [];
                }
                this.scrapeHistory.push(msg);
                Posts.update(
                    { _id: this._id},
                    { $set: {dateTime: msg.dateTime, location: msg.location, scrapeHistory: this.scrapeHistory} },
                    function(err, count) {
                        if (err) {
                            console.log("There was an error updating post");
                            throw err;
                        }
                        console.log("Updated " + count + " post" + count!=1? 's' : '');
                    }
                );
            };
            return entry;
        }
    });

Posts.allow({
    update: function(userId, post) { return ownsDocument(userId, post); },
    remove: function(userId, post) { return ownsDocument(userId, post); }
});

Posts.deny({
    update: function(userId, post, fieldNames) {
        // may only edit the following seven fields:
        return (_.without(fieldNames, 'url', 'title', 'scraper', 'schedule', 'yearlySchedule', 'monthlySchedule', 'weeklySchedule', 'dailySchedule').length > 0);
    }
});

Posts.deny({
    update: function(userId, post, fieldNames, modifier) {
        var errors = validatePost(modifier.$set);
        return errors.title || errors.url || errors.scraper || errors.schedule || errors.yearlySchedule || errors.monthlySchedule || errors.weeklySchedule || errors.dailySchedule;
    }
});

validatePost = function (post) {
    var errors = {};

    if (!post.title)
        errors.title = "Please fill in a headline";

    if (!post.url)
        errors.url =  "Please fill in a URL";

    if (!post.scraper)
        errors.scraper =  "Please fill in a Scraper";

    if (!post.schedule)
        errors.schedule =  "Please fill in a Schedule";

    /*
    if (!post.yearlySchedule)
        errors.yearlySchedule =  "Please fill in a yearly schedule";

    if (!post.monthlySchedule)
        errors.monthlySchedule =  "Please fill in a monthly schedule";

    if (!post.weeklySchedule)
        errors.weeklySchedule =  "Please fill in a weekly schedule";

    if (!post.dailySchedule)
        errors.dailySchedule =  "Please fill in a daily schedule";
    */
    return errors;
};

Meteor.methods({
    postInsert: function(postAttributes) {
        check(this.userId, String);
        check(postAttributes, {
            title: String,
            url: String,
            scraper: String,
            schedule: String
        });

        var errors = validatePost(postAttributes);
        if (errors.title || errors.url)
            throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

        var postWithSameLink = Posts.findOne({url: postAttributes.url});
        if (postWithSameLink) {
            return {
                postExists: true,
                _id: postWithSameLink._id
            }
        }

        var user = Meteor.user();
        var post = _.extend(postAttributes, {
            userId: user._id,
            author: user.username,
            submitted: new Date(),
            commentsCount: 0,
            upvoters: [],
            votes: 0
        });

        var postId = Posts.insert(post);

        return {
            _id: postId
        };
    },

    upvote: function(postId) {
        check(this.userId, String);
        check(postId, String);

        var affected = Posts.update({
            _id: postId,
            upvoters: {$ne: this.userId}
        }, {
            $addToSet: {upvoters: this.userId},
            $inc: {votes: 1}
        });

        if (! affected)
            throw new Meteor.Error('invalid', "You weren't able to upvote that post");
    },

    scrape: function(id, url, title, scraper) {
        check(id, String);
        check(url, String);
        check(title, String);
        check(scraper, String);
        if (Meteor.isServer) {
//            Meteor.call('zmqServerScrape', id, url, title, scraper);
            Meteor.call('httpServerScrape', id, url, title, scraper);
        }
    }
});