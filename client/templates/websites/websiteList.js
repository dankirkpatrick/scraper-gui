Template.websiteList.helpers({
    websites: function() {
        return Websites.find({}, { sort: { createdAt: -1}});
    }
});

Template.websiteInput.events = {
    'keydown input#url' : function (event) {
        if (event.which == 13) { // 13 is the enter key event
            var url = document.getElementById('url');
            if (Meteor.user() && url.value != '') {
                Meteor.call('fetchUrl', url.value);
                /*
                 Websites.insert({
                 url: fetchUrl.value,
                 createdAt: new Date(),
                 owner: Meteor.userId(),
                 username: Meteor.user().username
                 });
                 */
            }

            document.getElementById('url').value = '';
            url.value = '';
        }
    },
    'click .delete' : function (event) {

    }
};
