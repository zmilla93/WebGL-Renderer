const Shapes = {};
{
    const cubeVertices = [
        // Top
        new Vertex(new Vector3(-1, 1, -1), new Vector3(0, 1, 0)),
        new Vertex(new Vector3(-1, 1, 1), new Vector3(1, 0, 0)),
        new Vertex(new Vector3(1, 1, 1), new Vector3(1, 0, 1)),
        new Vertex(new Vector3(1, 1, -1), new Vector3(0, 0, 1)),

        // South/Front
        new Vertex(new Vector3(-1, 1, 1), new Vector3(0, 1, 0)),
        new Vertex(new Vector3(-1, -1, 1), new Vector3(0, 1, 0)),
        new Vertex(new Vector3(1, -1, 1), new Vector3(0, 1, 0)),
        new Vertex(new Vector3(1, 1, 1), new Vector3(0, 1, 0)),

        // East
        new Vertex(new Vector3(1, 1, 1), new Vector3(0, 1, 1)),
        new Vertex(new Vector3(1, -1, 1), new Vector3(0, 1, 1)),
        new Vertex(new Vector3(1, -1, -1), new Vector3(0, 1, 1)),
        new Vertex(new Vector3(1, 1, -1), new Vector3(0, 1, 1)),

        // North/Back
        new Vertex(new Vector3(1, 1, -1), new Vector3(1, 1, 1)),
        new Vertex(new Vector3(1, -1, -1), new Vector3(1, 1, 1)),
        new Vertex(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)),
        new Vertex(new Vector3(-1, 1, -1), new Vector3(1, 1, 1)),

        // West
        new Vertex(new Vector3(-1, 1, -1), new Vector3(0.5, 1, 0)),
        new Vertex(new Vector3(-1, -1, -1), new Vector3(0.5, 1, 0)),
        new Vertex(new Vector3(-1, -1, 1), new Vector3(0.5, 1, 0)),
        new Vertex(new Vector3(-1, 1, 1), new Vector3(0.5, 1, 0)),

        // Bottom
        new Vertex(new Vector3(-1, -1, 1), new Vector3(1, 0, 0)),
        new Vertex(new Vector3(-1, -1, -1), new Vector3(1, 0, 0)),
        new Vertex(new Vector3(1, -1, -1), new Vector3(1, 0, 0)),
        new Vertex(new Vector3(1, -1, 1), new Vector3(1, 0, 0)),
    ]

    const cubeIndices = [
        0, 1, 2, 2, 3, 0,       // Top
        4, 5, 6, 6, 7, 4,       // South/Front
        8, 9, 10, 10, 11, 8,    // East
        12, 13, 14, 14, 15, 12, // North/Back
        16, 17, 18, 18, 19, 16, // West
        20, 21, 22, 22, 23, 20, // Bottom
    ]
    Shapes.oldCube = new Shape(cubeVertices, cubeIndices);

    Shapes.cube = {
        top: [
            { position: vec3.fromValues(-1, 1, -1), normal: UP_VECTOR },
            { position: vec3.fromValues(-1, 1, 1), normal: UP_VECTOR },
            { position: vec3.fromValues(1, 1, 1), normal: UP_VECTOR },
            { position: vec3.fromValues(1, 1, -1), normal: UP_VECTOR },
        ],
        bottom: [
            { position: vec3.fromValues(-1, -1, 1), normal: DOWN_VECTOR },
            { position: vec3.fromValues(-1, -1, -1), normal: DOWN_VECTOR },
            { position: vec3.fromValues(1, -1, -1), normal: DOWN_VECTOR },
            { position: vec3.fromValues(1, -1, 1), normal: DOWN_VECTOR },
            // new Vertex(new Vector3(-1, -1, 1), new Vector3(1, 0, 0)),
            // new Vertex(new Vector3(-1, -1, -1), new Vector3(1, 0, 0)),
            // new Vertex(new Vector3(1, -1, -1), new Vector3(1, 0, 0)),
            // new Vertex(new Vector3(1, -1, 1), new Vector3(1, 0, 0)),
        ],
        north: [
            { position: vec3.fromValues(1, 1, -1), normal: FORWARD_VECTOR },
            { position: vec3.fromValues(1, -1, -1), normal: FORWARD_VECTOR },
            { position: vec3.fromValues(-1, -1, -1), normal: FORWARD_VECTOR },
            { position: vec3.fromValues(-1, 1, -1), normal: FORWARD_VECTOR },
            // new Vertex(new Vector3(1, 1, -1), new Vector3(1, 1, 1)),
            // new Vertex(new Vector3(1, -1, -1), new Vector3(1, 1, 1)),
            // new Vertex(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)),
            // new Vertex(new Vector3(-1, 1, -1), new Vector3(1, 1, 1)),
        ],
        east: [
            { position: vec3.fromValues(1, 1, 1), normal: RIGHT_VECTOR },
            { position: vec3.fromValues(1, -1, 1), normal: RIGHT_VECTOR },
            { position: vec3.fromValues(1, -1, -1), normal: RIGHT_VECTOR },
            { position: vec3.fromValues(1, 1, -1), normal: RIGHT_VECTOR },
            // new Vertex(new Vector3(1, 1, 1), new Vector3(0, 1, 1)),
            // new Vertex(new Vector3(1, -1, 1), new Vector3(0, 1, 1)),
            // new Vertex(new Vector3(1, -1, -1), new Vector3(0, 1, 1)),
            // new Vertex(new Vector3(1, 1, -1), new Vector3(0, 1, 1)),
        ],
        south: [
            { position: vec3.fromValues(-1, 1, 1), normal: BACK_VECTOR },
            { position: vec3.fromValues(-1, -1, 1), normal: BACK_VECTOR },
            { position: vec3.fromValues(1, -1, 1), normal: BACK_VECTOR },
            { position: vec3.fromValues(1, 1, 1), normal: BACK_VECTOR },
            // new Vertex(new Vector3(-1, 1, 1), new Vector3(0, 1, 0)),
            // new Vertex(new Vector3(-1, -1, 1), new Vector3(0, 1, 0)),
            // new Vertex(new Vector3(1, -1, 1), new Vector3(0, 1, 0)),
            // new Vertex(new Vector3(1, 1, 1), new Vector3(0, 1, 0)),
        ],
        west: [
            { position: vec3.fromValues(-1, 1, -1), normal: LEFT_VECTOR },
            { position: vec3.fromValues(-1, -1, -1), normal: LEFT_VECTOR },
            { position: vec3.fromValues(-1, -1, 1), normal: LEFT_VECTOR },
            { position: vec3.fromValues(-1, 1, 1), normal: LEFT_VECTOR },
            // new Vertex(new Vector3(-1, 1, -1), new Vector3(0.5, 1, 0)),
            // new Vertex(new Vector3(-1, -1, -1), new Vector3(0.5, 1, 0)),
            // new Vertex(new Vector3(-1, -1, 1), new Vector3(0.5, 1, 0)),
            // new Vertex(new Vector3(-1, 1, 1), new Vector3(0.5, 1, 0)),
        ],
        // new Vertex(new Vector3(-1, 1, -1), new Vector3(0, 1, 0)),
        // new Vertex(new Vector3(-1, 1, 1), new Vector3(1, 0, 0)),
        // new Vertex(new Vector3(1, 1, 1), new Vector3(1, 0, 1)),
        // new Vertex(new Vector3(1, 1, -1), new Vector3(0, 0, 1)),

        //     // South/Front


        //     // East


        //     // North/Back


        //     // West


        //     // Bottom

    }

    // Shapes.Voxel = cubeData;

    // const cubeIndices = [
    //     0, 1, 2, 2, 3, 0,       // Top
    //     4, 5, 6, 6, 7, 4,       // South/Front
    //     8, 9, 10, 10, 11, 8,    // East
    //     12, 13, 14, 14, 15, 12, // North/Back
    //     16, 17, 18, 18, 19, 16, // West
    //     20, 21, 22, 22, 23, 20, // Bottom
    // ]
    // Shapes.cube = new Shape(cubeVertices, cubeIndices);


    // const quadVertices = [
    //     // Top
    //     new Vertex(new Vector3(-1, 1, -1), new Vector3(1, 0, 0)),
    //     new Vertex(new Vector3(-1, 1, 1), new Vector3(0, 1, 0)),
    //     new Vertex(new Vector3(1, 1, 1), new Vector3(0, 0, 1)),
    //     new Vertex(new Vector3(1, 1, -1), new Vector3(1, 1, 1)),
    // ]
    // const quadIndices = [
    //     0, 1, 2, 2, 3, 0,       // Top
    // ]
    // Shapes.quad = new Shape(quadVertices, quadIndices);

    Shapes.quad = {
        top: [
            { position: vec3.fromValues(-1, 1, -1), normal: UP_VECTOR },
            { position: vec3.fromValues(-1, 1, 1), normal: UP_VECTOR },
            { position: vec3.fromValues(1, 1, 1), normal: UP_VECTOR },
            { position: vec3.fromValues(1, 1, -1), normal: UP_VECTOR },
        ]
    }

}