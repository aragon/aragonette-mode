// read the file newlogs.json
import fs from "fs";
const newLogs = JSON.parse(fs.readFileSync("newLogs.json", "utf-8"));

console.log(newLogs.length);

for (const log of newLogs) {
  console.log(log.length);
}
