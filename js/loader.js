if (window == parent) {
    console.log('This should be run inside iframe.')
} else {
    window.addEventListener("message", function (event) {
        var url = event.data;
        toDataUrl(url, function (data) {
            parent.postMessage({image: {url: url, base64: data}}, '*');
        });
    }, false);

    function toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
    }

    parent.postMessage({initialized: true}, '*');
    console.log('loader active.');
}
