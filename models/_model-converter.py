import os

dir = "D:/Projects/Webcraft/Models/"
outFile = dir + "_models.js";

files = os.listdir(dir);
output = open(outFile, "w")

for file in files:
    if file.endswith(".obj"):
        print("Converting " + file + "...")
        name = file.replace(".obj", "")
        stream = open(dir + file, "r")
        data = stream.read()
        output.write("const " + name + "Model = `\n" + data + "\n`\n\n")

output.close()
print("Model conversion complete!")