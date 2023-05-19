const { query, escape } = require('../lib/mysql')

module.exports = class SellerModel {
  async getSellers (filter = []) {
    let sql = `SELECT s.seller_id, s.company FROM ys_seller s`
    if (filter['name']) {
      sql += ` WHERE s.company LIKE '%${filter['name']}%'`
    }

    sql += ` LIMIT ${filter['start']}, ${filter['limit']}`

    const results = await query(sql)

    if (!results)
      return {
        error: false,
        sellers: []
      }

    return {
      error: false,
      sellers: results
    }
  }

  async getSeller (path) {
    let sql = `SELECT s.seller_id, s.company, s.commission, s.commission_date, s.visit, s.status, s.createdat,sd.description, sd.picture FROM ys_seller s LEFT JOIN ys_seller_description sd ON s.seller_id = sd.seller_id WHERE s.seo = '${escape(
      path
    )}'`

    let results = await query(sql)
    if (results && results[0]) {
      results[0].picture =
        'https://webv1.yapisepeti.com.tr/public/seller/default/ikon.png'

      return results[0]
    }

    return []
  }
}
