class ShaderFile:
    def __init__(self, fileName, variableName):
        self.fileName = fileName
        self.variableName = variableName

directory = "D:/Projects/WebCraft/Shaders/"
litVertex = ShaderFile("vertex.glsl", "litVertex")
litFragment = ShaderFile("fragment.glsl", "litFragment")
lineVertex = ShaderFile("line.vs", "lineVertex")
lineFragment = ShaderFile("line.fs", "lineFragment")
shaders = [litVertex, litFragment, lineVertex, lineFragment]

output = open(directory + "shaders.js", "w")
output.write("// This file was auto-generated with shader-converter.py.\n")
output.write("// It contains a javascript version of all shader code.\n\n")

for shader in shaders:
    source = open(directory + shader.fileName, "r")
    print("Converting " + shader.fileName + "...")
    output.write("const " + shader.variableName + "Source = `\n")
    output.write(source.read())
    output.write("`\n\n")
    
output.close()
print("Shader file generated!")