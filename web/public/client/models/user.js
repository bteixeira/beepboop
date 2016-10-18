window.P = window.P || {};

P.models = P.models || {};

P.models.user = Backbone.Model.extend({});

P.user = new P.models.user({
    name: $('h1.name').text(),
    credits: parseFloat($('.credits-data').first().text())
});

P.user.on('change:credits', function (user, credits) {
    $('.credits-data').text(credits);
    if (credits >= 10) {
        $('#game-summary-items .game-summary-item button').removeAttr('disabled');
    } else {
        $('#game-summary-items .game-summary-item button').attr('disabled', '');
    }
});
