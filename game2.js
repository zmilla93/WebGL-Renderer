
// // var engine;
// var gl2;

// function main(){
//     const canvas = document.getElementById("coolCanvas");
//     gl2 = canvas.getContext("webgl2", { antialias: true, depth: true });

//     engine = new Engine(canvas);
//     engine.setupDefaultShaders();

//     var gameObject = new GameObject();
//     var renderer = new MeshRenderer()

//     window.requestAnimationFrame(game2Loop);
    
//     // alert("!");
// }

// function game2Loop(){

//     gl2.useProgram(lineShader);
//     const fieldOfView = 60 * DEG2RAD;
//     const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//     const zNear = 0.01;
//     const zFar = 1000.0;
//     const projectionMatrix = mat4.create();
//     mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
//     const fullTransform = mat4.create();
//     mat4.mul(fullTransform, projectionMatrix, cam.getWorldtoViewMatrix());
//     // mat4.mul(fullTransform, fullTransform, cam.getWorldtoViewMatrix());
//     // const transformMatrix = mat4.create();
//     // mat4.mul(transformMatrix, )
//     const projectionMatrixLocation = gl.getUniformLocation(lineShader, "projectionMatrix");
//     gl2.uniformMatrix4fv(projectionMatrixLocation, false, fullTransform);

//     gl2.bindVertexArray(lineVAO);
//     var lineData = Line.data;
//     console.log(lineVAO);
//     // gl.lineWidth(10);
//     gl2.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
//     gl2.drawArrays(gl.LINES, 0, Line.lineList.length * 2);

//     engine.render();
//     window.requestAnimationFrame(game2Loop);
//     // console.log(GameObject.gameObjectList);
//     // console.log("gam2");
// }

// window.addEventListener('load', main);