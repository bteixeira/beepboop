window.P = window.P || {};

P.API = {
    getBatch: function (callback) {
        $.get('/api/getNextSet', function (data) {
            data = data.map(function (it) {
                return new P.models.modelItem(it);
            });
            callback(data);
        });
    }
};
