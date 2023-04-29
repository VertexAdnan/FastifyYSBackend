const { query, escape } = require('../lib/mysql')

const {
  htmlEntities,
  replace,
  generateImage,
  parseIds,
  discountRate,
  removeTags
} = require('../helper/String')

module.exports = class ProductModel {
  async getProductDiscounted (start = 0, limit = 20) {
    let sql = `SELECT product_id FROM ys_product WHERE special > 0 AND status = 1 LIMIT ${start}, ${limit}`
    return await query(sql)
  }
  async getProductQuestions (product_id) {
    let sql = `SELECT q.*, m.*, CONCAT(c.firstname, ' ', c.lastname) as customer FROM ys_qa q LEFT JOIN ys_qa_messages m ON m.qa_id = q.qa_id LEFT JOIN oc_customer c ON c.customer_id = q.customer_id WHERE q.product_id = ${product_id}`

    const results = await query(sql)

    return results
  }
  async getProductViewed (start = 0, limit = 20) {
    let sql = `SELECT product_id FROM ys_product ORDER BY viewed DESC LIMIT ${start}, ${limit}`

    return await query(sql)
  }
  async getProductBySold (start = 0, limit = 20) {
    let sql = `SELECT product_id FROM ys_product ORDER BY soldcount DESC LIMIT ${start}, ${limit}`

    return await query(sql)
  }
  async getReviewsAll (product_id) {
    let sql = `SELECT
    pr.*,
    CONCAT( c.firstname, ' ', c.lastname ) AS customer,
    s.company AS seller 
  FROM
    ys_product_review pr
    LEFT JOIN oc_customer c ON c.customer_id = pr.customer_id
    LEFT JOIN ys_product p ON p.product_id = pr.product_id
    LEFT JOIN ys_seller s ON s.seller_id = p.seller_id 
    WHERE pr.confirmed = 1
    AND pr.deleted = 0
    AND pr.product_id = ${product_id}
		  ORDER BY
    pr.createdat DESC`

    return await query(sql)
  }
  async getProducts (filter = []) {
    if (!filter['limit']) {
      filter['limit'] = 20
    }

    if (!filter['start']) {
      filter['start'] = 0
    }

    let sql = `SELECT DISTINCT p.product_id, (
            SELECT AVG(DISTINCT rate) FROM ys_product_review r WHERE r.product_id = pd.product_id
        ) as rating,(
            SELECT COUNT(DISTINCT rate) FROM ys_product_review r WHERE r.product_id = pd.product_id
        ) as total_rating, pd.name, p.price, p.special, p.model, p.sku, p.mpn, p.image, cd.category_id, cd.name as category, m.manufacturer_id, m.name as manufacturer, s.seller_id, s.company, p.product_seo 
        FROM ys_product p 
        LEFT JOIN ys_product_description pd ON pd.product_id = p.product_id
        LEFT JOIN oc_category_description cd ON p.category_id = cd.category_id
        LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
        LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
        LEFT JOIN oc_category c ON c.category_id = p.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        WHERE p.status = 1`

    if (filter['category']) {
      sql += ` AND c.category_id = ${filter['category']}`
    }

    if (filter['category_ids']) {
      sql += ` AND c.category_id IN(${filter['category_ids']})`
    }

    if (filter['path']) {
      sql += ` AND cp.path_id IN (${filter['path']})`
    }

    if (filter['manufacturer']) {
      sql += ` AND p.manufacturer_id IN (${filter['manufacturer']})`
    }

    if (filter['product_ids']) {
      sql += ` AND p.product_id IN (${filter['product_ids']})`
    }

    if (filter['seller']) {
      sql += ` AND s.seller_id IN (${filter['seller']})`
    }

    if (filter['name']) {
      sql += ` AND pd.name LIKE '%${escape(filter['name'])}'`
    }

    sql += ` LIMIT ${filter['start']}, ${filter['limit']}`

    const results = await query(sql)
    let output = []

    results.map(val => {
      output.push({
        product_id: parseInt(val.product_id),
        name: val.name,
        price: parseFloat(val.price),
        special: parseFloat(val.special),
        discountRate: discountRate(val.price, val.special),
        image: generateImage(val.image),
        mpn: parseInt(val.mpn),
        rating: val.rating ? parseInt(val.rating) : 0,
        ratingCount: val.ratingCount ? parseInt(val.ratingCount) : 0,
        category_id: parseInt(val.category_id),
        category: val.category,
        manufacturer_id: val.manufacturer_id,
        manufacturer: val.manufacturer,
        seller_id: val.seller_id,
        seller: val.company,
        href: val.product_seo
      })
    })
    return output
  }

  async getProduct (param) {
    let sql = `SELECT p.product_id, p.sku, cd.category_id, p.status, ps.title as status_name, 
    ck.cargokey, ck.title as shipping_cargo, pd.name, p.price, p.special, 
    p.seller_id, p.tax_rate, p.weight, s.company as seller, s.seo as seller_seo, 
    p.model, p.quantity as quantity, p.image, p.mpn, p.quantity,p.manufacturer_id, m.name AS manufacturer,
     pd.description, cd.category_id, cd.name as category, cd.seo_url as category_seo,
     (SELECT AVG(rr.rate) FROM ys_product_review rr WHERE rr.product_id = p.product_id) as rate,
     (SELECT COUNT(r.rate) FROM ys_product_review r WHERE r.product_id = p.product_id) as rateCount
     FROM ys_product p
    LEFT JOIN ys_product_description pd ON pd.product_id = p.product_id
    LEFT JOIN oc_category_description cd ON cd.category_id = p.category_id
    LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
    LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
    LEFT JOIN ys_seller_shipment sss ON sss.seller_id = p.seller_id
    LEFT JOIN ys_cargokeys ck ON ck.cargokey = sss.cargokey
    LEFT JOIN ys_product_status ps ON ps.status_id = p.status`

    if (parseInt(param) && parseInt(param) != 0) {
      sql += ` WHERE p.product_id = ${parseInt(param)}`
    } else {
      sql += ` WHERE p.product_seo = '${escape(param)}'`
    }

    const results = await query(sql)

    return results
  }

  async getOptions (product_id) {
    let sql = `SELECT *, ov.name as option_value FROM ys_product_sku sku
    LEFT JOIN ys_sku_option sko ON sko.sku_id = sku.sku_id
    LEFT JOIN ys_option_value ov ON ov.option_value_id = sko.option_value_id
    LEFT JOIN ys_option_group og ON og.group_id = ov.group_id
    WHERE sku.product_id = ${product_id}`

    const results = await query(sql)
    if (!results) return []

    return results
  }

  async getImages (product_id) {
    let sql = `SELECT * FROM oc_product_image WHERE product_id = ${product_id}`

    const results = await query(sql)
    return results
  }
}
