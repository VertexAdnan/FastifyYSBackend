const { query, escape } = require('../lib/mysql')

module.exports = class ManufacturersModel {
    async getTotalManufacturers(filter = []){
        let sql = `SELECT COUNT(m.manufacturer_id) as count FROM oc_manufacturer m`;

        if(filter['name']){
            sql += ` WHERE m.name LIKE '%${escape(filter['name'])}%'`;
        }

        const results = await query(sql);
        return (results && results[0] && results[0].count ? results[0].count : 0);
    }
    async getManufacturersAll(filter = []){
        let sql = `SELECT m.manufacturer_id, m.name, m.seo_url, m.seller_id, m.createdat, s.company,
        (SELECT COUNT(p.product_id) FROM ys_product p WHERE p.manufacturer_id = m.manufacturer_id) as total_products 
        FROM oc_manufacturer m
        LEFT JOIN ys_seller s ON s.seller_id = m.seller_id
        WHERE m.manufacturer_id IS NOT NULL`;

        if(filter['onlySellers']){
            sql += ` AND m.seller_id > 0`
        }

        if(filter['name']){
            sql += ` AND m.name LIKE '%${escape(filter['name'])}%'`;
        }

        if(filter['seller']){
            sql += ` AND s.company LIKE '%${filter['seller']}%'`
        }

        if(filter['manufacturer_id']){
            sql += ` AND m.manufacturer_id = ${filter['manufacturer_id']}`
        }

        if(filter['date']){
            sql += ` AND m.createdat LIKE '%${filter['date']}%'`
        }

        if(filter['seller']){
            sql += ` AND m.seller_id = ${filter['seller']}`
        }

        sql += ` LIMIT ${filter['start']}, ${filter['limit']}`
       
        return await query(sql);
    }

    async getManufacturerData(id){
        let sql = `SELECT name, seo_url, description, seller_id FROM oc_manufacturer WHERE manufacturer_id = ${id}`;

        return await query(sql);
    }

    async getManufacturerWithPath(path){
        let sql = `SELECT * FROM oc_manufacturer m WHERE m.seo_url = '${escape(path)}' LIMIT 1`

        const results = await query(sql);

        if(!results) return [];

        return results[0];
    }
}