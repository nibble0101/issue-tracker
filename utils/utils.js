const { customAlphabet } = require("nanoid");
// const { readFile, writeFile } = require("fs/promises");

// const path = "./db/db.json";
const alphabet = "0123456789abcdefghijklmnop";
const nanoid = customAlphabet(alphabet, 21);

exports.getId = () => nanoid();
exports.getDate = () => new Date().toISOString();
// exports.readData = async () => {
//   const data = await readFile(path, "utf8");
//   return JSON.parse(data);
// };

// exports.writeData = async (data) => {
//   await writeFile(path, JSON.stringify(data));
// };
