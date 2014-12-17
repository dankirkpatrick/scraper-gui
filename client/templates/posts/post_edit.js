Template.postEdit.created = function() {
    Session.set('postEditErrors', {});
}

Template.postEdit.helpers({
    errorMessage: function(field) {
        return Session.get('postEditErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
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
    },
    selected: function(left, right) {
        return left == right ? 'selected': '';
    },
    bitfieldChecked: function(left, right) {
        return (left & right) ? 'checked': '';
    }
});

Template.postEdit.events({
    'submit form': function(e) {
        e.preventDefault();

        var currentPostId = this._id;

        var postProperties = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val(),
            scraper: $(e.target).find('[name=scraper]').val(),
            schedule: $(e.target).find('[name=schedule]').val(),
            yearlySchedule: $(e.target).find('[name=yearlySchedule]').val() === undefined? this.yearlySchedule : $(e.target).find('[name=yearlySchedule]').val(),
            monthlySchedule: $(e.target).find('[name=monthlySchedule]').val() === undefined? this.monthlySchedule : $(e.target).find('[name=monthlySchedule]').val(),
            weeklySchedule: $(e.target).find('[name=weeklySchedule]').val() === undefined? this.weeklySchedule : $(e.target).find('[name=weeklySchedule]').val(),
            dailySchedule:
                (($(e.target).find('[name=dailyScheduleMon]').length > 0 ? $(e.target).find('[name=dailyScheduleMon]')[0].checked == true ? 1 : 0 : this.dailySchedule & 1) |
                 ($(e.target).find('[name=dailyScheduleTue]').length > 0 ? $(e.target).find('[name=dailyScheduleTue]')[0].checked == true ? 2 : 0 : this.dailySchedule & 2) |
                 ($(e.target).find('[name=dailyScheduleWed]').length > 0 ? $(e.target).find('[name=dailyScheduleWed]')[0].checked == true ? 4 : 0 : this.dailySchedule & 4) |
                 ($(e.target).find('[name=dailyScheduleThu]').length > 0 ? $(e.target).find('[name=dailyScheduleThu]')[0].checked == true ? 8 : 0 : this.dailySchedule & 8) |
                 ($(e.target).find('[name=dailyScheduleFri]').length > 0 ? $(e.target).find('[name=dailyScheduleFri]')[0].checked == true ? 16 : 0 : this.dailySchedule & 16) |
                 ($(e.target).find('[name=dailyScheduleSat]').length > 0 ? $(e.target).find('[name=dailyScheduleSat]')[0].checked == true ? 32 : 0 : this.dailySchedule & 32) |
                 ($(e.target).find('[name=dailyScheduleSun]').length > 0 ? $(e.target).find('[name=dailyScheduleSun]')[0].checked == true ? 64 : 0 : this.dailySchedule & 64))
        };

        var errors = validatePost(postProperties);
        if (errors.title || errors.url || errors.schedule || errors.yearlySchedule || errors.monthlySchedule || errors.weeklySchedule || errors.dailySchedule)
            return Session.set('postEditErrors', errors);

        Posts.update(currentPostId, {$set: postProperties}, function(error) {
            if (error) {
                // display the error to the user
                alert(error.reason);
            } else {
                Router.go('postPage', {_id: currentPostId});
            }
        });
    },

    'click .delete': function(e) {
        e.preventDefault();

        if (confirm("Delete this post?")) {
            var currentPostId = this._id;
            Posts.remove(currentPostId);
            Router.go('home');
        }
    }
});