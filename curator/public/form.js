$(function () {

    function getHash() {
        console.log($('.image-hash').text());
        return $('.image-hash').text();
    }
    
    function getMetadata() {
        var metadata = {};
        $('#form-image').serializeArray().forEach(function (el) {
            metadata[el.name] = el.value;
        });
        console.log(metadata);
        return metadata;
    }

    $('#button-submit').on('click', function () {

        $.post('/api/saveImage', {
            hash: getHash(),
            metadata: getMetadata()
        }, function (data) {
            console.log(data);
            // TODO INVOKE getImage AGAIN AND RESTART THE PROCESS
            $('#controls select').each(function (i, el) {
                $(this).val(String(META_DEFAULTS[this.name]));
            });
            window.requestImage();
        });

    });
});