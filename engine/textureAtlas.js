
function drawImages() {

    const textureCanvas = document.getElementById("textureCanvas");
    const ctx = textureCanvas.getContext("2d");

    const textures = document.getElementsByClassName("texture");
    var texturesPerRow = Math.ceil(Math.sqrt(textures.length));
    var columnCount = Math.ceil(textures.length / texturesPerRow);
    var row = 0;
    var column = 0;
    const textureSize = 16;

    const atlasSize = (texturesPerRow + 1) * textureSize;
    textureCanvas.width = texturesPerRow * textureSize;
    textureCanvas.height = columnCount * textureSize;

    var uvLookup = {};
    for (var i = 0; i < textures.length; i++) {
        ctx.drawImage(textures[i], textureSize * row, textureSize * column);
        uvLookup[textures[i].name] = "WOW";
        row++;
        if (row >= texturesPerRow) {
            row = 0;
            column++;
        }
    }
}


// window.addEventListener('load', drawImages);