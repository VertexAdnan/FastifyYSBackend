const ManufacturersModel = require('../model/ManufacturersModel');

module.exports = class Manufacturer extends ManufacturersModel {
    async getManufacturers(filter = []){
        const results = await this.getManufacturersAll(filter);

        return {
            error: false,
            response: results
        }
    }

    async getManufacturer(id){
        if(!parseInt(id) || parseInt(id) <= 0) return {
            error: true,
            response: 'Geçersiz marka!'
        }

        const results = await this.getManufacturerData(parseInt(id));

        return results;
    }
}