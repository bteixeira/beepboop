window.P = window.P || {};

P.models = P.models || {};

P.models.modelItem = function (raw) {
    this.id = raw.id;
    this.contents = raw.contents;
    this.mimeType = raw.mimeType;
    this._raw = raw;
};

P.models.modelItem.prototype.getSrc = function () {
    return 'data:' + this.mimeType + ';base64,' + this.contents;
};
