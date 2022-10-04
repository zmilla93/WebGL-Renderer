function objToMesh(obj) {
    var lines = obj.trim().split('\n');
    var verticesRaw = [];
    var uvsRaw = [];
    var normalsRaw = [];
    var vertices = [];
    var uvs = [];
    var normals = [];
    var vertexCount = 0;
    var triangles = [];
    for (var line of lines) {
        var cleanLine = line.trim().replace(/\s+/, " ");
        var tokens = cleanLine.split(" ");
        switch (tokens[0]) {
            case 'o':
                // Mesh Name
                break;
            case 'v':
                // Vertex
                verticesRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'vt':
                // UVs
                uvsRaw.push(vec2.fromValues(tokens[1], tokens[2]));
                break;
            case 'vn':
                // Normals
                normalsRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'f':
                // Face
                for (let i = 1; i < tokens.length; i++) {
                    var values = tokens[i].split("/");
                    vertices.push(verticesRaw[values[0] - 1]);
                    uvs.push(uvsRaw[values[1] - 1]);
                    normals.push(normalsRaw[values[2] - 1]);
                }
                switch (tokens.length - 1) {
                    case 3:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        vertexCount += 3;
                        break;
                    case 4:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 3);
                        triangles.push(vertexCount);
                        vertexCount += 4;
                        break;
                    default:
                        console.error("Unhandled Face Vertex Count: " + (tokens.length - 1));
                        break;
                }
                break;
            default:
                break;
        }
    }
    const mesh = new Mesh();
    mesh.vertices = vertices;
    mesh.uvs = uvs;
    mesh.normals = normals;
    mesh.triangles = triangles;
    mesh.createData();
    mesh.createBuffer(Engine.gl, Engine.defaultVertexAttributes);
    mesh.buffer(Engine.gl);
    return mesh;
}

function objToVoxelModel(obj) {
    var lines = obj.trim().split('\n');
    var verticesRaw = [];
    var uvsRaw = [];
    var normalsRaw = [];
    var vertices = [];
    var uvs = [];
    var normals = [];
    var vertexCount = 0;
    var triangles = [];
    for (var line of lines) {
        var cleanLine = line.trim().replace(/\s+/, " ");
        var tokens = cleanLine.split(" ");
        switch (tokens[0]) {
            case 'o':
                // Mesh Name
                break;
            case 'v':
                // Vertex
                verticesRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'vt':
                // UVs
                uvsRaw.push(vec2.fromValues(tokens[1], tokens[2]));
                break;
            case 'vn':
                // Normals
                normalsRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'f':
                // Face
                // var direction = ;
                for (let i = 1; i < tokens.length; i++) {
                    var values = tokens[i].split("/");
                    vertices.push(verticesRaw[values[0] - 1]);
                    uvs.push(uvsRaw[values[1] - 1]);
                    normals.push(normalsRaw[values[2] - 1]);
                    console.log(normalsRaw[values[2] - 1]);
                    console.log(getFacingDirection(normalsRaw[values[2] - 1]));
                }
                switch (tokens.length - 1) {
                    case 3:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        vertexCount += 3;
                        break;
                    case 4:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 3);
                        triangles.push(vertexCount);
                        vertexCount += 4;
                        break;
                    default:
                        console.error("Unhandled Face Vertex Count: " + (tokens.length - 1));
                        break;
                }
                break;
            default:
                break;
        }
    }
    const mesh = new Mesh();
    mesh.vertices = vertices;
    mesh.uvs = uvs;
    mesh.normals = normals;
    mesh.triangles = triangles;
    return mesh;
}