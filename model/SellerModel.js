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

  async getSeller (path, customer_id = 0) {
    let sql = `SELECT s.seller_id, s.company, s.commission, s.commission_date, s.visit, s.status, s.createdat,sd.description, sd.picture,
    (SELECT count(ys.follow_id) FROM ys_seller_subs ys WHERE ys.seller_id = s.seller_id) as follower_count,
    (SELECT avg(sr.rate) FROM ys_seller_review sr WHERE sr.seller_id = s.seller_id) as seller_point,
    (SELECT count(sr.review_id) FROM ys_seller_review sr WHERE sr.seller_id = s.seller_id) as review_count,
    (SELECT count(p.product_id) FROM ys_product p WHERE p.seller_id = s.seller_id AND p.status = 1) as product_count,
    (SELECT customer_id FROM ys_seller_subs ss WHERE ss.seller_id = s.seller_id AND ss.customer_id = ${(customer_id)}) as isFollowing
    FROM ys_seller s 
    LEFT JOIN ys_seller_description sd ON s.seller_id = sd.seller_id
    WHERE s.seo = '${escape(
      path
    )}'`


    let results = await query(sql)

    let output = {};
    if (results && results[0]) {
      /*results[0].picture =
        'https://webv1.yapisepeti.com.tr/public/seller/default/ikon.png'

      return results[0]*/

      output = {
        seller_id: parseInt(results[0].seller_id),
        company: (results[0].company ? results[0].company : ''),
        commission: (results[0].commission ? results[0].commission : 0),
        commission_date: (results[0].commission_date ? results[0].commission_date : "0000-00-00"),
        visit: (results[0].visit ? results[0].visit : 0),
        createdat: (results[0].createdat ? results[0].createdat : ''),
        description: (results[0].description ? results[0].description : ''),
        picture: (results[0].picture ? results[0].picture : 'https://webv1.yapisepeti.com.tr/public/seller/default/ikon.png'),
        follower_count: (results[0].follower_count ? results[0].follower_count: 0),
        seller_point: (results[0].seller_point ? (results[0].seller_point).toFixed(2) : 0),
        review_count: (results[0].review_count? results[0].review_count : 0),
        product_count: (results[0].product_count ? results[0].product_count : 0 ),
        isFollowing: (results[0].isFollowing ? true : false)
      }
    }

    return output
  }
}
