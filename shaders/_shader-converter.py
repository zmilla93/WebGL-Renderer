import os

dir = "shaders"
outputFile = "_shaders.js"
files = os.listdir(dir)

output = open(dir + "/" + outputFile, "w")
output.write("// This file was auto-generated with shader-converter.py.\n")
output.write("// It contains a javascript version of all shader code.\n\n")

for file in files:
    if (file.endswith("vs") or file.endswith("fs")):
        print("Converting " + file + "...")
        name = ""
        if (file.endswith(".vs")):
            name = file.replace(".vs", "VertexSource")
        if (file.endswith(".fs")):
            name = file.replace(".fs", "FragmentSource")
        stream = open(dir + "/" + file, "r")
        data = stream.read()
        output.write("const " + name + " = `\n" + data + "\n`\n\n")

output.close()
print("Shader file generated!")
