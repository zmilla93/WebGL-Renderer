// TEXTURE SETUP
    // const texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // const level = 0;
    // const internalFormat = gl.RGBA;
    // const width = 1;
    // const height = 1;
    // const border = 0;
    // const srcFormat = gl.RGBA;
    // const srcType = gl.UNSIGNED_BYTE;
    // const pixel = new Uint8Array([0, 0, 255, 255]);
    // gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    // const image = new Image();
    // image.onload = function () {
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    //     gl.generateMipmap(gl.TEXTURE_2D);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     drawScene();
    // }
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    //     console.log("pow2");
    //     gl.generateMipmap(gl.TEXTURE_2D);
    // } else {
    //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // }
    // image.src = "textures/bedrock.png";
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);