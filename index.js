#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const juice = require("juice");
const svgr = require("@svgr/core").default;
const SVGO = require("svgo");
const svg2jsx = require("@balajmarius/svg2jsx");
const program = require("commander");
const svgson = require("svgson");

const { version } = require("./package.json");
const { config } = require("./configSvgo.js");

// Constants
const PATH_TO_OUTPUT_DIR = `./components`;
const CONFIG_SVGR = {
  native: true,
  plugins: ["@svgr/plugin-jsx", "@svgr/plugin-prettier"]
};

program
  .version(version)
  .option("-i --input [inpath]", "select input folder")
  .option("-o --output [outpath]", "select output folder")
  .option("--expo", "transform to expo format")
  .option("--ts", "used typescript")
  .option("--suffix", "append suffix icon for out files")
  .on("--help", () => {
    console.log("\nExamples:");
    console.log(`$ svg2rn`);
    console.log(`$ svg2rn -i ./assets/svg/`);
    console.log(`$ svg2rn -o /home/user/icon/`);
    console.log(`$ svg2rn --expo`);
    console.log(`$ svg2rn --ts`);
    console.log("");
  })
  .parse(process.argv);

// Helpers
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const addAttrsWidthHeightToSvg = async svg => {
  try {
    const res = await svgson.parse(svg);

    if (res && res.attributes && res.attributes.viewBox) {
      const viewBox = res.attributes.viewBox.split(" ");
      res.attributes.width = viewBox[2];
      res.attributes.height = viewBox[3];
    }

    return svgson.stringify(res);
  } catch (e) {
    throw new Error(e);
  }
};

// Write new svg file
const writeSvgFile2Js = async (
  { svg, componentName, destinationPath },
  callback
) => {
  try {
    // Config SVGO
    let svgo = new SVGO(config);
    const svgWH = await addAttrsWidthHeightToSvg(svg);
    // console.log('true => ', true);
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
        }
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

    // Check support typescript
    if (program.ts) {
      result = transformToTs(result);
    }

    // Write file
    fs.writeFile(destinationPath, result, err => {
      if (err) console.error(err);
      else callback();
    });
  } catch (e) {
    console.warn(`Error! Parced file ${destinationPath} with error - ${e}`);
  }
};

const trasformToExpo = jsx => {
  const jsxArr = jsx.split(";\n");
  jsxArr[1] = `import { Svg } from 'expo'`;
  let data = jsxArr.join(";\n");

  data = data.replace(/<(\w+)/g, str => {
    let newStr = "";
    if (str !== "<Svg") {
      newStr = str.replace("<", "<Svg.");
    } else {
      newStr = str;
    }

    return newStr;
  });

  return data.replace(/<\/(\w+)/g, str => {
    let newStr = "";
    if (str !== "</Svg") {
      newStr = str.replace("</", "</Svg.");
    } else {
      newStr = str;
    }

    return newStr;
  });
};

const transformToTs = jsx => {
  const regexpImportPropsWithExt = / } from/g;
  const regexpProps = /= props =/;
  const isExpo = program.expo;

  if (isExpo) {
    return jsx.replace(regexpProps, "= (props: any) =");
  } else {
    const res = regexpImportPropsWithExt.exec(jsx);
    if (!res[0]) return jsx;

    const data = jsx.slice(0, res.index) + ", SvgProps" + jsx.slice(res.index);

    return data.replace(regexpProps, "= (props: SvgProps) =");
  }
};

const main = () => {
  const inPath = path.resolve(program.input || __dirname);
  const outPath = path.resolve(program.output || PATH_TO_OUTPUT_DIR);
  const haveSuffix = !!program.suffix;

  // Check dirs
  if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);

  // Read all files from dir
  const files = fs.readdirSync(inPath);

  files.forEach(file => {
    if (path.extname(file) !== ".svg") return false;
    const timeStart = performance.now();

    // Work with files
    const sourcePath = path.join(inPath, file);
    const componentName = `${capitalize(path.basename(file, ".svg").trim())}${
      haveSuffix ? "Icon" : ""
    }`.replace(/-/g, "_");
    const destinationPath = path.join(
      outPath,
      `${componentName}.${program.ts ? "tsx" : "js"}`
    );

    const svg = fs.readFileSync(sourcePath, { encoding: "utf-8" });

    const payload = { svg, componentName, destinationPath };

    writeSvgFile2Js(payload, () => {
      const timeFinish = parseInt(performance.now() - timeStart);
      console.log("");
      console.log(`${sourcePath}: => ${destinationPath}`);
      console.log(`Done in ${timeFinish} ms!`);
    });
  });
};

main();
