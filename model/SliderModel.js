const fs = require('fs');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports = class SliderModel {
    async readSliders(){
        const file = fs.readFileSync(`${appDir}/docs/slider.json`)

        return JSON.parse(file)
    }
}