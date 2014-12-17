var POST_HEIGHT = 80;
var Positions = new Meteor.Collection(null);

Template.postItem.helpers({
    ownPost: function() {
        return this.userId == Meteor.userId();
    },
    locationExists: function() {
        return (typeof this.location !== 'undefined');
    },
    domain: function() {
        var a = document.createElement('a');
        a.href = this.url;
        return a.hostname;
    },
    upvotedClass: function() {
        var userId = Meteor.userId();
        if (userId && !_.include(this.upvoters, userId)) {
            return 'btn-primary upvotable';
        } else {
            return 'disabled';
        }
    },
    attributes: function() {
        var post = _.extend({}, Positions.findOne({postId: this._id}), this);
        var newPosition = post._rank * POST_HEIGHT;
        var attributes = {};

        if (_.isUndefined(post.position)) {
            attributes.class = 'post invisible';
        } else {
            var delta = post.position - newPosition;
            attributes.style = "top: " + delta + "px";
            if (delta === 0)
                attributes.class = "post animate"
        }

        Meteor.setTimeout(function() {
            Positions.upsert({postId: post._id}, {$set: {position: newPosition}})
        });

        return attributes;
    },
    getSchedule: function(schedule) {
        if (schedule == '1') {
            return 'Once';
        } else if (schedule == '2') {
            return 'Yearly';
        } else if (schedule == '3') {
            return 'Monthly';
        } else if (schedule == '4') {
            return 'Weekly';
        } else if (schedule == '5') {
            return 'Daily';
        } else if (schedule == '6') {
            return 'Hourly';
        }
        return 'Do not scrape';
    }
});

Template.postItem.events({
    'click .upvotable': function(e) {
        e.preventDefault();
        Meteor.call('upvote', this._id);
    },
    'click .btn-scrape': function(e) {
        e.preventDefault();
        console.log('Scrape ' + this.url);
        Meteor.call('scrape', this._id, this.url, this.title, this.scraper);
    },
    'click .btn-parse': function(e) {
        e.preventDefault();
        console.log('Parse ' + this.title);
        //Meteor.call('parse', this.url, this.title, 'phantom');
    }
});