window.P = window.P || {};

P.models = P.models || {};

P.models.guessItem = Backbone.Model.extend({
    getSrc: function () {
        return 'data:' + this.get('mimeType') + ';base64,' + this.get('contents');
    }
});
