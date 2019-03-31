#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const juice = require("juice");
const svgr = require("@svgr/core").default;
const SVGO = require("svgo");
const svg2jsx = require("@balajmarius/svg2jsx");
const program = require("commander");
const svgson = require('svgson')

const { version } = require("./package.json");
const { config } = require("./configSvgo.js");

// Constants
const PATH_TO_COMPONENT_DIR = `./components`;
const CONFIG_SVGR = {
  native: true,
  plugins: ["@svgr/plugin-jsx", "@svgr/plugin-prettier"]
};

program
  .version(version)
  .option("-o --output [outpath]", "select output folder")
  .option("--expo", "transform to expo format")
  .option("--suffix", "append suffix icon for out files")
  .on("--help", () => {
    console.log("\nExamples:");
    console.log(`$ svg2rn`);
    console.log(`$ svg2rn -o /home/user/icon`);
    console.log(`$ svg2rn --expo`);
    console.log("");
  })
  .parse(process.argv);

// Helpers
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const addAttrsWidthHeightToSvg = async svg => {
  const res = await svgson.parse(svg);

  if (res && res.attributes && res.attributes.viewBox) {
    const viewBox = res.attributes.viewBox.split(' ');
    res.attributes.width = viewBox[2];
    res.attributes.height = viewBox[3];
  }

  return svgson.stringify(res)
};

// Write new svg file
const writeSvgFile2Js = async ({
  svg,
  file,
  componentName,
  pathFileToMin,
  timeStart,
}) => {
  // Config SVGO
  let svgo = new SVGO(config);
  const svgWH = await addAttrsWidthHeightToSvg(svg);
  // Optimize svg
  let svgOptimize = await svgo.optimize(svgWH);
  // Transform svg class to inner style
  const svgClassToStyleAttrs = juice(svgOptimize.data, { xmlMode: true });
  // Remove class element
  svgo = new SVGO({
    plugins: [
      {
        removeAttrs: { attrs: "(class)" }
      },
      {
        removeViewBox: false
      },
    ]
  });
  svgOptimize = await svgo.optimize(svgClassToStyleAttrs);
  // Convert svg to jsx format
  const jsx = await svg2jsx(svgOptimize.data);
  // Convert jsx to React Native format
  let result = await svgr(jsx, CONFIG_SVGR, { componentName });

  // Check support expo
  if (program.expo) {
    result = trasformToExpo(result);
  }

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

const trasformToExpo = jsx => {
  const jsxArr = jsx.split(';\n');
  jsxArr[1] = `import { Svg } from 'expo'`
  let data = jsxArr.join(';\n');

  data = data.replace(/<(\w+)/g, str => {
    let newStr = '';
    if (str !== '<Svg') {
      newStr = str.replace('<', '<Svg.')
    } else {
      newStr = str;
    }

    return newStr;
  })
  
  return data.replace(/<\/(\w+)/g, str => {
    let newStr = '';
    if (str !== '</Svg') {
      newStr = str.replace('</', '</Svg.')
    } else {
      newStr = str;
    }

    return newStr;
  })
};

const main = () => {
  const outPath = program.output || PATH_TO_COMPONENT_DIR;
  const haveSuffix = !!program.suffix;

  // Check dirs
  if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);

  // Read all files from dir
  const files = fs.readdirSync("./");

  files.forEach(file => {
    if (path.extname(file) !== ".svg") return false;
    const timeStart = performance.now();

    // Work with files
    const svg = fs.readFileSync(`./${file}`, { encoding: "utf-8" });
    const componentName = `${capitalize(path.basename(file, ".svg").trim())}${haveSuffix ? 'Icon' : ''}`;
    const pathFileToMin = `${outPath}/${componentName}.js`;

    const payload = {
      svg,
      file,
      componentName,
      pathFileToMin,
      timeStart,
    };

    writeSvgFile2Js(payload);
  });
};

main();
