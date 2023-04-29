const { query, escape } = require('../lib/mysql')

module.exports = class SellerModel {
    async getSellers(filter = []){
        let sql = `SELECT s.seller_id, s.company FROM ys_seller s`
        if(filter['name']){
            sql += ` WHERE s.company LIKE '%${filter['name']}%'`
        }

        sql += ` LIMIT ${filter['start']}, ${filter['limit']}`

        const results = await query(sql);

        if(!results) return {
            error: false,
            sellers: []
        }

        return {
            error: false,
            sellers: results
        }
    }
}