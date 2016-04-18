(function ($) {
    var $iframe = $('<iframe style="display: none"/>').attr('src', 'https://coiiector.github.io/cors-loader/iframe.html');
    var $body;

    var images = {};
    var loadFromIframe;
    window.loadImage = function (url) {
        if (!(url in images)) {
            images[url] = $.Deferred();
            if (loadFromIframe) {
                loadFromIframe(url);
            }
        }

        return images[url];
    };

    window.addEventListener("message", function (event) {
        var data = event.data;
        if (data.initialized) {
            initialize();
            $.each(images, function (key, value) {
                loadFromIframe(key);
            });
        }

        if (data.image) {
            var d = images[data.image.url];
            if (d) {
                d.resolve(data.image.base64);
            }
        }
    }, false);


    $(function () {
        $body = $(document.body);
        $body.append($iframe);

    });

    function initialize() {
        var iframeWindow = $iframe[0].contentWindow;
        loadFromIframe = function (url) {
            iframeWindow.postMessage(url, '*');
        }
    }
})(jQuery);