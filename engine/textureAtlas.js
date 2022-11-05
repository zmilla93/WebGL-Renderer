
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
    console.log(uvLookup);

    // for (y = 0; y < texturesPerRow; y++) {
    //     for (x = 0; x < texturesPerRow; x++) {
    //         ctx.drawImage(images[imagesProcessed], 10, 10);
    //         imagesProcessed++;
    //         if (imagesProcessed >= images.length) break;
    //     }
    // }


    // ctx.drawImage(bedrock, 10, 10);
    console.log("IMAGES!??");

}


// window.addEventListener('load', drawImages);