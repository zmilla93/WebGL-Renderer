import os

class ShaderFile:
    def __init__(self, fileName, variableName):
        self.fileName = fileName
        self.variableName = variableName

dir = "D:/Projects/WebCraft/Shaders/"
files = os.listdir(dir);
# litVertex = ShaderFile("vertex.glsl", "litVertex")
# litFragment = ShaderFile("fragment.glsl", "litFragment")
# lineVertex = ShaderFile("line.vs", "lineVertex")
# lineFragment = ShaderFile("line.fs", "lineFragment")
# shaders = [litVertex, litFragment, lineVertex, lineFragment]



output = open(dir + "shaders.js", "w")
output.write("// This file was auto-generated with shader-converter.py.\n")
output.write("// It contains a javascript version of all shader code.\n\n")

# for shader in shaders:
#     source = open(directory + shader.fileName, "r")
#     print("Converting " + shader.fileName + "...")
#     output.write("const " + shader.variableName + "Source = `\n")
#     output.write(source.read())
#     output.write("`\n\n")

for file in files:
    if(file.endswith("vs") or file.endswith("fs")):
        print("Converting " + file + "...")
        name = ""
        if(file.endswith(".vs")):
            name = file.replace(".vs", "VertexSource")
        if(file.endswith(".fs")):
            name = file.replace(".fs", "FragmentSource")
        stream = open(dir + file, "r")
        data = stream.read()
        output.write("const " + name + " = `\n" + data + "\n`\n\n")
    
output.close()
print("Shader file generated!")