const SliderModel = require('../model/SliderModel')
var moment = require('moment-timezone');

module.exports = class Slider extends SliderModel {
  async getSliders () {
    const sliders = await this.readSliders()
    const currentTime = moment().tz("Europe/Istanbul").format();
    let results = [];

    sliders.map((v) => {
        const start = moment(currentTime).diff(v.date_start, 'minutes');
        const end = moment(currentTime).diff(v.date_end, 'minutes');
        
        console.log(start)
        console.log(end)
        if(start > 0 && end < 0){
            results.push(v)
        }
    })

    return results
  }
}
