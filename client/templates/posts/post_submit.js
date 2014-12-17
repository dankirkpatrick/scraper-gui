Template.postSubmit.created = function() {
    Session.set('postSubmitErrors', {});
}

Template.postSubmit.helpers({
    errorMessage: function(field) {
        return Session.get('postSubmitErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('postSubmitErrors')[field] ? 'has-error' : '';
    },
    getScheduleOptions: function() {
        return [
            {'value': 0, 'label':'Do not scrape'},
            {'value': 1, 'label':'Scrape once'},
            {'value': 2, 'label':'Scrape yearly'},
            {'value': 3, 'label':'Scrape monthly'},
            {'value': 4, 'label':'Scrape weekly'},
            {'value': 5, 'label':'Scrape weekdays'},
            {'value': 6, 'label':'Scrape daily'}
        ];
    }
});

Template.postSubmit.events({
    'submit form': function(e) {
        e.preventDefault();

        var post = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val(),
            scraper: $(e.target).find('[name=scraper]').val(),
            schedule: $(e.target).find('[name=schedule]').val()
        };
        console.log('URL: ' + post.url);
        console.log('Title: ' + post.title);
        console.log('Scraper: ' + post.scraper);
        console.log('Schedule: ' + post.schedule);
        var errors = validatePost(post);
        if (errors.title || errors.url)
            return Session.set('postSubmitErrors', errors);

        Meteor.call('postInsert', post, function(error, result) {
            // display the error to the user and abort
            if (error)
                return throwError(error.reason);

            // show this result but route anyway
            if (result.postExists)
                throwError('This link has already been posted');

            Router.go('postPage', {_id: result._id});
        });
    }
});
