window.P = window.P || {};

P.API = {
    getBatch: function (callback) {
        $.get('/api/getNextSet', function (data) {
            data = data.map(function (it) {
                return new P.models.guessItem(it);
            });
            callback(data);
        });
    },
    makeGuess: function (id, guess, callback) {
        $.post('/api/makeGuess', {user: 'Kintaro', id: id, guess: guess}, function (data) {
            $('.credits-data').text(data.credits);
            callback(data.correct);
        });
    },
    buyImage: function (id, callback) {
        $.post('/api/buyImage', {id: id}, function (data) {
            $('.credits-data').text(data.credits);
            callback(data);
        });
    }
};
