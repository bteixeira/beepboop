window.P = window.P || {};

P.overlay = {
    _$overlay: $('#overlay'),
    _$overlayMsg: $('#overlay-msg'),
    _$msgBox: $('#overlay-msg .msg-box'),
    show: function () {
        this._$overlay.removeClass('hidden');
    },
    hide: function () {
        this._$overlay.toggleClass('hidden', true);
    },
    showAlert: function (msg) {
        this._$msgBox.html(msg);
        this._$overlayMsg.removeClass('hidden');
        this.hide();
        var me = this;
        window.setTimeout(function () {
            me._$overlayMsg.toggleClass('hidden', true);
        }, 1000);
    }
};
