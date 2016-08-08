$(function () {
    $('#btn-start').on('click', function () {

        P.overlay.show();
        P.API.getBatch(function (batch) {
            batch.forEach(function (item) {
                $('#guess-items').prepend(P.comps.guessItem(item));
            });
            $('body').removeClass('show-dashboard').toggleClass('show-game', true);
            P.overlay.hide();
        });





    })
});