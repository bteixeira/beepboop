window.P = window.P || {};

P.models = P.models || {};

P.models.modelItem = function (raw) {
    this._raw = raw;
};

P.models.modelItem.prototype.getSrc = function () {
    return 'data:' + this._raw.mimeType + ';base64,' + this._raw.contents;
};
