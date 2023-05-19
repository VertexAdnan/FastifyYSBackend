const ManufacturersModel = require('../model/ManufacturersModel');

module.exports = class Manufacturer extends ManufacturersModel {
    async getManufacturers(filter = []){
        const results = await this.getManufacturersAll(filter);
        const count = await this.getTotalManufacturers(filter);
        
        if(!results){
            return {
                error: true,
                count: 0,
                response: 'Ürün bulunamadı'
            }
        }

        let output = [];

        results.map( (val) => {
            const date = new Date(val.createdat).toLocaleString('TR').split(' ');
            output.push({
                manufacturer_id: val.manufacturer_id,
                name: val.name,
                seo_url: val.seo_url,
                total_products: val.total_products,
                createdat: new Date(val.createdat).toLocaleString('TR'),
                date: date[0],
                hrs: date[1],
                added_by: val.seller_id && val.seller_id > 0 ? val.company : 'ADMIN'
            })
        })

        return {
            error: false,
            count: count,
            response: output
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

    async getWithPath(path){
        const results = await this.getManufacturerWithPath(path);

        return results;
    }
}