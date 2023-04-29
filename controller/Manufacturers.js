const ManufacturersModel = require('../model/ManufacturersModel');

module.exports = class Manufacturer extends ManufacturersModel {
    async getManufacturers(filter = []){
        const results = await this.getManufacturersAll(filter);

        return {
            error: false,
            response: results
        }
    }
}