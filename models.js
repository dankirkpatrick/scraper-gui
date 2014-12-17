/**
 * Models
 */
Websites = new Meteor.Collection('websites');

Meteor.methods({
    fetchUrl: function(url) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Websites.insert({
            url: url,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().profile.name
        });
    }
});