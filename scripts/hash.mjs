import bcrypt from "bcryptjs";
console.log((await bcrypt.hash(process.argv[2], 12)).replace(/\$/g, "\\$"));
