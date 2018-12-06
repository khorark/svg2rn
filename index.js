#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const juice = require('juice');
const svgr = require('@svgr/core').default;

// Constants
const PATH_TO_COMPONENT_DIR = `./components`;
const CONFIG_SVGR = {
    native: true,
    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
}

// Check dirs
if (!fs.existsSync(PATH_TO_COMPONENT_DIR)) fs.mkdirSync(PATH_TO_COMPONENT_DIR);

// Helpers
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const writeSvgFile2Js = async ({ data, file, componentName, pathFileToMin, timeStart }) => {
    const result = await svgr(data, CONFIG_SVGR,{ componentName, })

    fs.writeFile(pathFileToMin, result, err => {
        if (err) console.error(err);
        else {
            const timeFinish = parseInt(performance.now() - timeStart);
            console.log('');
            console.log(`${file}: => ${componentName}.js`);
            console.log(`Done in ${timeFinish} ms!`);
        }
    })
}


// Read all files from dir
const files = fs.readdirSync('./');

files.forEach(file => {
    if (path.extname(file) !== '.svg') return false;
    const timeStart = performance.now();

    // Work with files
    const svgData = fs.readFileSync(`./${file}`, { encoding: 'utf-8' });

    const componentName = `${capitalize(path.basename(
        file,
        '.svg'
    ))}Icon`

    const pathFileToMin = `${PATH_TO_COMPONENT_DIR}/${componentName}.js`;

    const data = juice(svgData).replace('viewbox', 'viewBox');

    const payload = {
        data,
        file,
        componentName,
        pathFileToMin,
        timeStart
    }

    writeSvgFile2Js(payload)
})