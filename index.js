#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const juice = require("juice");
const svgr = require("@svgr/core").default;
const SVGO = require('svgo');
const svg2jsx = require('@balajmarius/svg2jsx')
const program = require("commander");

const { version } = require("./package.json");
const { config } = require('./configSvgo.js');

// Constants
const PATH_TO_COMPONENT_DIR = `./components`;
const CONFIG_SVGR = {
  native: true,
  plugins: ["@svgr/plugin-jsx", "@svgr/plugin-prettier"]
};

// Config SVGO
const svgo = new SVGO(config);

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
  svg,
  file,
  componentName,
  pathFileToMin,
  timeStart
}) => {
  // Optimize svg
  const svgOptimize = await svgo.optimize(svg);
  // Transform svg class to inner style
  const svgClassToStyleAttrs = juice(svgOptimize.data, { xmlMode: true });
  // Convert svg to jsx format
  const jsx = await svg2jsx(svgClassToStyleAttrs);
  // Convert jsx to React Native format
  const result = await svgr(jsx, CONFIG_SVGR, { componentName });  
  // Write file
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
    const svg = fs.readFileSync(`./${file}`, { encoding: "utf-8" });

    const componentName = `${capitalize(path.basename(file, ".svg"))}Icon`;

    const pathFileToMin = `${outPath}/${componentName}.js`;
   
    const payload = {
      svg,
      file,
      componentName,
      pathFileToMin,
      timeStart
    };

    writeSvgFile2Js(payload);
  });
};

main();
