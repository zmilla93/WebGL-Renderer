class ShaderFile:
    def __init__(self, fileName, variableName):
        self.fileName = fileName
        self.variableName = variableName

vertexShader = ShaderFile("shaders/vertex.glsl", "vertexShaderSource");
fragmentShader = ShaderFile("shaders/fragment.glsl", "fragmentShaderSource");
shaders = [vertexShader, fragmentShader]

output = open("shaders/shaders.js", "w")
output.write("// This file was auto-generated with shader-converter.py.\n")
output.write("// It contains a javascript version of all shader code.\n\n")

for shader in shaders:
    source = open(shader.fileName, "r")
    print("Converting " + shader.fileName + "...")
    output.write("const " + shader.variableName + " = `\n");
    output.write(source.read());
    output.write("`\n\n")
    
output.close();
print("Shader file generated!")