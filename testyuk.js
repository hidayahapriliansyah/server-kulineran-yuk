var convertArrayToObject = function (imageGallery) {
    var imageObject = {};
    for (var i = 0; i < 5; i++) {
        var key = "image".concat(i + 1);
        var value = imageGallery[i] || ''; // Jika elemen tidak ada, gunakan string kosong
        imageObject[key] = value;
    }
    return imageObject;
};
// Contoh penggunaan
var imageGallery = ['http://image.com/image1', 'http://image.com/image2'];
var result = convertArrayToObject(imageGallery);
console.log(result);
