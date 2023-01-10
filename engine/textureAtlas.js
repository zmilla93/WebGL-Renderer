
function createTextureAtlas() {
    const textureCanvas = document.getElementById("textureCanvas");
    const ctx = textureCanvas.getContext("2d");

    const textures = document.getElementsByClassName("voxelTexture");
    var texturesPerRow = Math.ceil(Math.sqrt(textures.length));
    var columnCount = Math.ceil(textures.length / texturesPerRow);
    var row = 0;
    var column = 0;
    const textureSize = 16;

    const atlasSize = (texturesPerRow + 1) * textureSize;
    textureCanvas.width = texturesPerRow * textureSize;
    textureCanvas.height = columnCount * textureSize;

    const textureWidth = textureSize * texturesPerRow;
    const textureHeight = textureSize * columnCount;
    var uvLookup = {};
    for (var i = 0; i < textures.length; i++) {
        ctx.drawImage(textures[i], textureSize * row, textureSize * column);
        const p3 = [(row * textureSize) / textureWidth, 1 - (column * textureSize) / textureHeight];
        const p2 = [(row * textureSize + textureSize) / textureWidth, 1 - (column * textureSize) / textureHeight];
        const p1 = [(row * textureSize + textureSize) / textureWidth, 1 - (column * textureSize + textureSize) / textureHeight];
        const p4 = [(row * textureSize) / textureWidth, 1 - (column * textureSize + textureSize) / textureHeight];
        uvLookup[textures[i].name] = [p1, p2, p3, p4];
        row++;
        if (row >= texturesPerRow) {
            row = 0;
            column++;
        }
    }
    var atlas = {
        image: textureCanvas,
        uvLookup: uvLookup,
    }
    return atlas;
}