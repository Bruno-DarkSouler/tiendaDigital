const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

async function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);

  const tempPath = `${filePath}.tmp`;

  await fs.writeFile(
    tempPath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  await fs.rename(tempPath, filePath);
}

module.exports = {
  readJSON,
  writeJSON
};