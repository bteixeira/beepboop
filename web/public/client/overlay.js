window.P = window.P || {};

P.overlay = {
    _overlay: $('#overlay'),
    show: function () {
        this._overlay.removeClass('hidden');
    },
    hide: function () {
        this._overlay.toggleClass('hidden', true);
    }
};
