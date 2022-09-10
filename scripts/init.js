const fs = require("fs")
const path = require("path")
const child_process = require("child_process")

fs.copyFileSync(path.resolve("./.env.example"), path.resolve("./env"))
