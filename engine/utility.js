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
    mesh.createBuffer(Engine.defaultVertexAttributes);
    mesh.buffer(Engine.gl);
    return mesh;
}

class Face {
    vertexCount = 0;
    vertices = [];
    normals = [];
    uvs = [];
}

function objToVoxelMesh(obj) {
    var lines = obj.trim().split('\n');
    var verticesRaw = [];
    var uvsRaw = [];
    var normalsRaw = [];
    // var vertices = [];
    // var uvs = [];
    // var normals = [];
    // var vertexCount = 0;
    // var triangles = [];
    var voxelMesh = new VoxelMesh();
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
                var normal = -1;
                var face = new Face();
                for (let i = 1; i < tokens.length; i++) {
                    // Track the normal of the face. 
                    // -1 = unset
                    // -2 = unaligned normal
                    var values = tokens[i].split("/");
                    var curNormal = values[values.length - 1];
                    // console.log("CUR:" + curNormal);
                    if (normal == -1) normal = curNormal;
                    else if (normal != curNormal) normal = -2;

                    face.vertices.push(verticesRaw[values[0] - 1]);
                    face.uvs.push(uvsRaw[values[1] - 1]);
                    face.normals.push(normalsRaw[values[2] - 1]);
                    face.vertexCount++;

                    // vertices.push(verticesRaw[values[0] - 1]);
                    // uvs.push(uvsRaw[values[1] - 1]);
                    // normals.push(normalsRaw[values[2] - 1]);
                }
                // Face Normal (Null if non matching normals)
                var norm = norm == -2 ? null : normalsRaw[normal - 1];
                // Direction Symbol
                var facingDirection = norm == null ? Direction.Unknown : getFacingDirection(norm);
                // Direction String, used as key
                var facing = symbolToString(facingDirection);
                voxelMesh.faces[facing].push(face);
                // switch (tokens.length - 1) {
                //     case 3:
                //         triangles.push(vertexCount);
                //         triangles.push(vertexCount + 1);
                //         triangles.push(vertexCount + 2);
                //         vertexCount += 3;
                //         break;
                //     case 4:
                //         triangles.push(vertexCount);
                //         triangles.push(vertexCount + 1);
                //         triangles.push(vertexCount + 2);
                //         triangles.push(vertexCount + 2);
                //         triangles.push(vertexCount + 3);
                //         triangles.push(vertexCount);
                //         vertexCount += 4;
                //         break;
                //     default:
                //         console.error("Unhandled Face Vertex Count: " + (tokens.length - 1));
                //         break;
                // }
                break;
            default:
                break;
        }
    }
    // console.log("this");
    // console.log(voxelMesh);
    return voxelMesh;
}

function symbolToString(symbol) {
    var str = symbol.toString();
    return str.substring(7, str.length - 1);
}