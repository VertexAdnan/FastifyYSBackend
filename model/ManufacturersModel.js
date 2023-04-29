const { query, escape } = require('../lib/mysql')

module.exports = class ManufacturersModel {
    async getManufacturersAll(filter = []){
        let sql = `SELECT m.manufacturer_id, m.name, m.seo_url, 
        (SELECT COUNT(p.product_id) FROM ys_product p WHERE p.manufacturer_id = m.manufacturer_id) as total_products FROM oc_manufacturer m`;

        if(filter['name']){
            sql += ` WHERE m.name LIKE '%${escape(filter['name'])}%'`;
        }

        sql += ` LIMIT ${filter['start']}, ${filter['limit']}`

        return await query(sql);
    }
}