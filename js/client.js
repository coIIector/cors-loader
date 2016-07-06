(function ($) {
    var isHttps = location.protocol == 'https:';
    var $body;
    $(function () {
        $body = $(document.body);
    });

    var domains = {};
    var rejected = $.Deferred().reject();

    function getInstance(src) {
        var match = src.match(/(https?:\/\/[^/?]+)/);
        if (match) {
            var ret = domains[match[1]];
            if (ret) {
                return ret;
            }
        }

        console.error('No iframe found for', src);
    }

    window.CorsLoader = {
        add: function (iframeSrc) {
            var match = iframeSrc.match(/((https?:)\/\/[^/?]+)/);
            if (match && (!isHttps || match[2] == 'https:')) {
                var domain = match[1];
                if (!(!domain in domains)) {
                    var $iframe = $('<iframe style="display: none"/>').attr('src', iframeSrc);
                    domains[domain] = {
                        handler: null,
                        images: {},
                        textFiles: {},
                        $iframe: $iframe
                    };
                    $(function () {
                        $body.append($iframe);
                    });

                }
            }
        },

        // todo: allow disabling caching

        loadImage: function (imageSrc) {
            var o = getInstance(imageSrc);
            if (o) {
                var images = o.images;
                if (!(imageSrc in images)) {
                    images[imageSrc] = $.Deferred();
                    if (o.handler) {
                        o.handler(imageSrc, 'DataURL');
                    }
                }

                return images[imageSrc];
            }

            return rejected;
        },
        
        loadText: function (textSrc) { // todo: encoding ?
            var o = getInstance(textSrc);
            if (o) {
                var images = o.textFiles;
                if (!(textSrc in images)) {
                    images[textSrc] = $.Deferred();
                    if (o.handler) {
                        o.handler(textSrc, 'Text');
                    }
                }

                return images[textSrc];
            }

            return rejected;
        }
    };

    window.addEventListener("message", function (event) {
        var o = domains[event.origin];
        if (o) {
            var data = event.data;

            if (data.corsInitialized) {
                var iframeWindow = o.$iframe[0].contentWindow;
                var handler = o.handler = function (src, type) {
                    iframeWindow.postMessage({src: src, type: type}, '*');
                };

                $.each(o.images, function (key, value) {
                    handler(key, 'DataURL');
                });

                $.each(o.textFiles, function (key, value) {
                    handler(key, 'Text');
                });
            } else {
                var corsData = data.corsData;
                if (corsData) {
                    var oo;
                    if (corsData.type == 'DataURL') {
                        oo = o.images;
                    } else {
                        oo = o.textFiles;
                    }

                    var d = oo[corsData.src];
                    if (d) {
                        d.resolve(corsData.content);
                    }
                }
            }
        }
    }, false);
})(jQuery);