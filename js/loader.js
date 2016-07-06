if (window == parent) {
    console.error('This should be run inside iframe.')
} else {
    window.addEventListener("message", function (event) {
        var data = event.data;
        process(data, function (result) {
            parent.postMessage({corsData: {src: data.src, content: result, type: data.type}}, '*');
        });
    }, false);

    function process(data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            if (data.type == 'DataURL') {
                reader.readAsDataURL(xhr.response);
            } else {
                reader.readAsText(xhr.response);
            }
        };
        xhr.open('GET', data.src);
        xhr.send();
    }

    parent.postMessage({corsInitialized: true}, '*');
    console.log('loader active.');
}
