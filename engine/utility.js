// A single face of a model.
// This engine currently only supports rendering 3 and 4 vertex faces.
class Face {
    vertexCount = 0;
    vertices = [];
    normals = [];
    uvs = [];
}

// Converts a wavefront .obj file into a Mesh that can be rendered by the engine.
// https://en.wikipedia.org/wiki/Wavefront_.obj_file
function objToMesh(obj, wireframe = false) {
    var lines = obj.trim().split('\n');
    var verticesRaw = [];
    var uvsRaw = [];
    var normalsRaw = [];
    var vertices = [];
    var uvs = [];
    var normals = [];
    var vertexCount = 0;
    var vertexCountWireframe = 0;
    var lineCount = 0;
    var triangles = [];
    var trianglesWireframe = [];
    var name = "UNNAMED MESH";
    for (var line of lines) {
        var cleanLine = line.trim().replace(/\s+/, " ");
        var tokens = cleanLine.split(" ");
        switch (tokens[0]) {
            case 'o':
                // Mesh Name
                name = tokens[1];
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
                var faceVertexCount = tokens.length - 1;
                switch (faceVertexCount) {
                    case 3:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        trianglesWireframe.push(vertexCount);
                        trianglesWireframe.push(vertexCount + 1);
                        trianglesWireframe.push(vertexCount + 1);
                        trianglesWireframe.push(vertexCount + 2);
                        trianglesWireframe.push(vertexCount + 2);
                        trianglesWireframe.push(vertexCount);
                        lineCount += 6;
                        vertexCount += 3;
                        break;
                    case 4:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 3);
                        triangles.push(vertexCount);
                        trianglesWireframe.push(vertexCount + 0);
                        trianglesWireframe.push(vertexCount + 1);
                        trianglesWireframe.push(vertexCount + 1);
                        trianglesWireframe.push(vertexCount + 2);
                        trianglesWireframe.push(vertexCount + 2);
                        trianglesWireframe.push(vertexCount + 0);
                        trianglesWireframe.push(vertexCount + 2);
                        trianglesWireframe.push(vertexCount + 3);
                        trianglesWireframe.push(vertexCount + 3);
                        trianglesWireframe.push(vertexCount + 0);
                        trianglesWireframe.push(vertexCount + 0);
                        trianglesWireframe.push(vertexCount + 2);
                        lineCount += 12;
                        vertexCount += 4;
                        break;
                    default:
                        console.error("Mesh \"" + name + "\" has a face with an unsupported vertex count (" + faceVertexCount + "). The face will not be rendered. Triangulate the model to fix this problem.");
                        break;
                }
                break;
            default:
                break;
        }
    }
    const mesh = new Mesh();
    mesh.wireframe = wireframe;
    mesh.vertices = vertices;
    mesh.uvs = uvs;
    mesh.normals = normals;
    mesh.triangles = triangles;
    mesh.trianglesWireframe = trianglesWireframe;
    mesh.lineCount = lineCount;
    mesh.createBuffer(Engine.defaultVertexAttributes);
    mesh.buffer(Engine.gl);
    return mesh;
}


// Converts a wavefront .obj file into a VoxelMesh.
// Intended to be used as a building block for a dynamic Mesh.
// Face data is stored based on normal to allow for easy face culling.
// https://en.wikipedia.org/wiki/Wavefront_.obj_file
function objToVoxelMesh(obj) {
    var lines = obj.trim().split('\n');
    var verticesRaw = [];
    var uvsRaw = [];
    var normalsRaw = [];
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
                }
                // Face Normal (Null if non matching normals)
                var norm = norm == -2 ? null : normalsRaw[normal - 1];
                // Direction Symbol
                var facingDirection = norm == null ? Direction.Unknown : getFacingDirection(norm);
                // Direction String, used as key
                var facing = symbolToString(facingDirection);
                voxelMesh.faces[facing].push(face);
                break;
            default:
                break;
        }
    }
    return voxelMesh;
}

function symbolToString(symbol) {
    var str = symbol.toString();
    return str.substring(7, str.length - 1);
}

function isPointWithinRect(x, y, rect) {
    if (x < rect.x || x > rect.x + rect.width) return false;
    if (y < rect.y || y > rect.y + rect.height) return false;
    return true;
}