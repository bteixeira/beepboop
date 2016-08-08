window.P = window.P || {};

P.API = {
    getBatch: function (callback) {
        $.get('/api/getNextSet', function (data) {
            data = data.map(function (it) {
                return new P.models.modelItem(it);
            });
            callback(data);
        });
    },
    makeGuess: function (id, guess, callback) {
        $.post('/api/makeGuess', {user: 'Kintaro', id: id, guess: guess}, function (data) {
            callback(data.correct);
        });
    }
};
