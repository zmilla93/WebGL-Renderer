

class Editor {
    constructor(controlName, gameObjectListName) {
        this.inspectorGameObjects = null;
        this.controlElement = document.getElementById(controlName);
        this.gameObjectListElement = document.getElementById(gameObjectListName);
        this.gameObjectList;
    }
    bindHTML() {

    }
}

// var inspectorGameObjects;
// var controlDiv;
// var objectList;



function main() {
    const controlDiv = document.getElementById("controls");
    const objectList = document.getElementById("gameObjectList");

    controlDiv.innerHTML = "Hello, World!";
    controlDiv.innerHTML = "Neat";
    objectList.innerHTML = "<option value='item1'>Test1</option>";
}

// function bindEditorHTML() {
//     controlDiv = document.getElementById("controls");
//     objectList = document.getElementById("gameObjectList");
//     objectList.onchange = function () {
//         console.log(objectList.value);
//     }
// }

function loadGameObjectList(gameObjectList) {
    inspectorGameObjects = gameObjectList;
    var html = [];
    var elementCount = 0;
    if (inspectorGameObjects != null && inspectorGameObjects.length > 0) {
        for (gameObject of inspectorGameObjects) {
            html.push("<option value='" + elementCount + "'>GameObject" + elementCount + "</option>\n")
            elementCount++;
        }
        objectList.innerHTML = html;
    } else {
        objectList.innerHTML = "";
    }
}

GameObject.getEditorHTML = function (gameObject) {
    const html = `<p>
        X <input type="number>
    </p>`
}

// window.addEventListener("load", main);

