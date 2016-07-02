$(function () {

    function getHash() {
        return $('.image-hash').text();
    }

    function getCrop() {
        var metadata = {};
        $('#form-crop').serializeArray().forEach(function (el) {
            metadata[el.name] = el.value;
        });
        return metadata;
    }
    
    function getMetadata() {
        var metadata = {};
        $('#form-meta').serializeArray().forEach(function (el) {
            metadata[el.name] = el.value;
        });
        return metadata;
    }

    $('#button-submit').on('click', function () {
        var metadata = getMetadata();
        metadata.crop = getCrop();
        $.post('/api/saveImage', {
            hash: getHash(),
            metadata: metadata
        }, function (data) {
            // TODO INVOKE getImage AGAIN AND RESTART THE PROCESS
            $('#controls select').each(function (i, el) {
                $(this).val(String(META_DEFAULTS[this.name]));
            });
            window.requestImage();
            $('#form-crop input').val('');
            $('.image-blur-overlay').remove();
            $('.image-selection-overlay').toggleClass('hidden', true);
        });



    });
});