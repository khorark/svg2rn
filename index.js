#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const juice = require("juice");
const svgr = require("@svgr/core").default;
const program = require("commander");
const { version } = require("./package.json");

// Constants
const PATH_TO_COMPONENT_DIR = `./components`;
const CONFIG_SVGR = {
  native: true,
  plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"]
};

program
  .version(version)
  .option("-o --output [outpath]", "Select output folder")
  .on("--help", () => {
    console.log("\nExamples:");
    console.log(`$ svg2rn`);
    console.log(`$ svg2rn -o /home/user/icon`);
    console.log("");
  })
  .parse(process.argv);

// Helpers
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const writeSvgFile2Js = async ({
  data,
  file,
  componentName,
  pathFileToMin,
  timeStart
}) => {
  const result = await svgr(data, CONFIG_SVGR, { componentName });

  fs.writeFile(pathFileToMin, result, err => {
    if (err) console.error(err);
    else {
      const timeFinish = parseInt(performance.now() - timeStart);
      console.log("");
      console.log(`${file}: => ${componentName}.js`);
      console.log(`Done in ${timeFinish} ms!`);
    }
  });
};

const main = () => {
  outPath = program.output || PATH_TO_COMPONENT_DIR;
  // Check dirs
  if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);

  // Read all files from dir
  const files = fs.readdirSync("./");

  files.forEach(file => {
    if (path.extname(file) !== ".svg") return false;
    const timeStart = performance.now();

    // Work with files
    const svgData = fs.readFileSync(`./${file}`, { encoding: "utf-8" });

    const componentName = `${capitalize(path.basename(file, ".svg"))}Icon`;

    const pathFileToMin = `${outPath}/${componentName}.js`;

    const data = juice(svgData).replace("viewbox", "viewBox");

    const payload = {
      data,
      file,
      componentName,
      pathFileToMin,
      timeStart
    };

    writeSvgFile2Js(payload);
  });
};

main();
