const { customAlphabet } = require("nanoid");

const alphabet = "0123456789abcdefghijklmnop";
const nanoid = customAlphabet(alphabet, 21);

exports.getId = () => nanoid();
exports.getDate = () => new Date().toISOString();
