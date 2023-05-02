import os

dir = "models"
outFile = "_models.js";

files = os.listdir(dir);
output = open(dir + "/" + outFile, "w")
output.write("// This file was auto-generated using model-converter.py.\n")
output.write("// It contains javascript variables for all .obj files in the models folder.\n\n")

for file in files:
    if file.endswith(".obj"):
        print("Converting " + file + "...")
        name = file.replace(".obj", "")
        stream = open(dir + "/" + file, "r")
        data = stream.read()
        output.write("const " + name + "Model = `\n" + data + "\n`\n\n")

output.close()
print("Model conversion complete!")