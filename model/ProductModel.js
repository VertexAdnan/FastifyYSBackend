const { query, escape } = require('../lib/mysql')

const {
  htmlEntities,
  replace,
  generateImage,
  parseIds,
  discountRate,
  removeTags,
  number_format
} = require('../helper/String')
const CategoriesModel = require('./CategoriesModel')

module.exports = class ProductModel {
  async partnerListing (filter = []) {
    let page = filter.page ? filter.page : 1
    let limit = filter.limit ? filter.limit : 20
    let start = (page - 1) * limit
    let seller_id = filter.seller_id ? filter.seller_id : 0

    if (!seller_id)
      return {
        error: true,
        response: 'Geçersiz mağaza'
      }

    let select = `SELECT
    p.product_id,
    p.date_added,
    ps.status_id,
    ps.title AS status,
    p.viewed,
    pd.name,
    p.sku,
    p.price,
    p.special,
    m.name AS manufacturer,
    p.image,
    cd.name AS category,
    (
    SELECT DISTINCT
      (
      SELECT
        GROUP_CONCAT( cd1.NAME ORDER BY LEVEL SEPARATOR ' > ' ) 
      FROM
        oc_category_path cp
        LEFT JOIN oc_category_description cd1 ON ( cp.path_id = cd1.category_id AND cp.category_id != cp.path_id ) 
      WHERE
        cp.category_id = c.category_id 
      GROUP BY
        cp.category_id 
      ) AS path 
    FROM
      oc_category c
      LEFT JOIN oc_category_description cd2 ON ( c.category_id = cd2.category_id )
      LEFT JOIN ys_commission_category cc ON ( cc.category_id = c.parent_id ) 
    WHERE
      c.category_id IS NOT NULL 
      AND c.category_id = p.category_id 
      LIMIT 1 
    ) AS 'category_path',
    ( SELECT COUNT( wp.product_id ) FROM ys_customer_wishlist wp WHERE wp.product_id = p.product_id ) as wishCount,
    ( SELECT COUNT( c.product_id ) FROM oc_cart c WHERE c.product_id = p.product_id AND c.completed = 0 ) as cartCount,
    ( SELECT AVG( r.rate ) FROM ys_product_review r WHERE r.product_id = p.product_id ) AS avg_rate,
    ( SELECT COUNT( op.product_id ) FROM ys_order_product op WHERE op.product_id = p.product_id ) AS orderCount,
    ( SELECT COUNT( op.product_id ) FROM ys_order_product op WHERE op.product_id = p.product_id AND op.STATUS = 7 ) AS cancelCount,
    ( SELECT COUNT( op.product_id ) FROM ys_order_product op WHERE op.product_id = p.product_id AND op.STATUS = 21 ) AS sellerCancelCount,
    ( SELECT COUNT( op.product_id ) FROM ys_order_product op WHERE op.product_id = p.product_id AND op.STATUS = 11 ) AS returnCount `;


    let sql = `${(filter.count && filter.count == 1) ? `SELECT COUNT(p.product_id) as count` : `${select}`}
  FROM
    ys_product p
    LEFT JOIN ys_product_description pd ON p.product_id = pd.product_id
    LEFT JOIN oc_category_description cd ON p.category_id = cd.category_id
    LEFT JOIN ys_product_status ps ON ps.status_id = p.status
    LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id`
    sql += ` WHERE p.seller_id = ${seller_id}`

    if (filter.product_name) {
      sql += ` AND pd.name LIKE '%${escape(filter.product_name)}%'`
    }

    if (filter.manufacturer) {
      sql += ` AND m.name LIKE '%${escape(filter.manufacturer)}%'`
    }

    if (filter.status) {
      sql += ` AND p.status = '${filter.status}'`
    }

    if (filter.category) {
      sql += ` AND cd.name LIKE '${filter.category}%'`
    }

    if(filter.count && filter.count == 1){
      const res = await query(sql);

      return {
        count: (res[0].count ? res[0].count : 0)
      };
    }

    let orderBy = filter.by && filter.by == 1 ? 'ASC' : 'DESC'

    if (filter.orderCart) {
      sql += ` ORDER BY ( SELECT COUNT( c.product_id ) FROM oc_cart c WHERE c.product_id = p.product_id AND c.completed = 0 ) ${orderBy}`
    }

    if (filter.orderCount) {
      sql += ` ORDER BY ( SELECT COUNT( op.product_id ) FROM ys_order_product op WHERE op.product_id = p.product_id ) ${orderBy}`
    }

    

    sql += ` LIMIT ${start}, ${limit}`

    const results = await query(sql)

    let output = []

    results.map(val => {
      output.push({
        product_id: val.product_id,
        date_added: val.date_added,
        status_id: val.status_id,
        status: val.status,
        viewed: val.viewed,
        name: val.name,
        sku: val.sku,
        price: number_format(val.price, 2, ',', '.'),
        special: number_format(val.price, 2, ',', '.'),
        manufacturer: val.manufacturer,
        image: generateImage(val.image),
        category: val.category,
        category_path: val.category_path,
        wishCount: val.wishCount,
        cartCount: val.cartCount,
        avg_rate: val.avg_rate ? val.avg_rate : 0,
        orderCount: val.orderCount,
        cancelCount: val.cancelCount,
        sellerCancelCount: val.sellerCancelCount,
        returnCount: val.returnCount,
        salePoint:
          100 -
          (100 * (val.cancelCount + val.sellerCancelCount + val.returnCount)) /
            val.orderCount
            ? 100 -
              (100 *
                (val.cancelCount + val.sellerCancelCount + val.returnCount)) /
                val.orderCount
            : 0
      })
    })

    return output
  }
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
  async getProductFreeShipping (start = 0, limit = 20) {
    let sql =
      'SELECT IFNULL(' +
      "(SELECT `price` FROM `ys_shippment_ranges` sr WHERE sr.`type` = 'total' and (p.`price` BETWEEN sr.`from` AND sr.`to`) AND sr.seller_id = p.seller_id LIMIT 1)," +
      " (SELECT `price` FROM `ys_shippment_ranges` sr WHERE sr.`type` = 'weight' and (p.`weight` BETWEEN sr.`from` AND sr.`to`) AND sr.seller_id = p.seller_id LIMIT 1)" +
      ') as shipping,product_id FROM ys_product p ' +
      `HAVING shipping IS NULL OR shipping = 0 LIMIT ${start},${limit}`
    let results = await query(sql)
    let pids = []
    results.map(val => {
      pids.push({ product_id: val.product_id })
    })
    return pids
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

    let select = `SELECT DISTINCT p.product_id,pd.name, p.viewed, p.status, 
    
    (SELECT AVG(DISTINCT rate) FROM ys_product_review r WHERE r.product_id = pd.product_id
  ) as rating,
  ${
    filter['customer_id']
      ? `(SELECT product_id FROM ys_customer_wishlist cww WHERE p.product_id = cww.product_id AND cww.customer_id = ${filter['customer_id']} LIMIT 1) as isFollowing,`
      : ``
  }
  (SELECT COUNT(w.product_id) FROM ys_customer_wishlist w WHERE w.product_id = p.product_id) as wishCount,
  (SELECT COUNT(ww.product_id) FROM oc_cart ww WHERE ww.product_id = p.product_id) as cartCount,
  (
      SELECT COUNT(DISTINCT rate) FROM ys_product_review r WHERE r.product_id = pd.product_id
  ) as total_rating, p.*, cd.category_id, cd.name as category, m.manufacturer_id, m.name as manufacturer, m.seo_url as 'manufacturer_seo', s.seller_id, s.company,ps.title as product_status,
  (SELECT DISTINCT
    (
    SELECT
        GROUP_CONCAT( cd1.NAME ORDER BY LEVEL SEPARATOR ' > ' ) 
    FROM
        oc_category_path cp
        LEFT JOIN oc_category_description cd1 ON ( cp.path_id = cd1.category_id AND cp.category_id != cp.path_id ) 
    WHERE
        cp.category_id = c.category_id 
    GROUP BY
        cp.category_id 
    ) AS path
    FROM
    oc_category c
    LEFT JOIN oc_category_description cd2 ON ( c.category_id = cd2.category_id )
    LEFT JOIN ys_commission_category cc ON (cc.category_id = c.parent_id )
    WHERE c.category_id IS NOT NULL AND c.category_id=p.category_id LIMIT 1) as 'category_path'`

    let sql = `${select}
  FROM ys_product p 
  LEFT JOIN ys_product_description pd ON pd.product_id = p.product_id
  LEFT JOIN oc_category_description cd ON p.category_id = cd.category_id
  LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
  LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
  LEFT JOIN oc_category c ON c.category_id = p.category_id
  LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
  LEFT JOIN ys_product_status ps ON ps.status_id = p.status
  ${
    filter['order'] && filter['order'] == 'cartcount'
      ? `INNER JOIN oc_cart wcc ON wcc.product_id = p.product_id`
      : ''
  }
  ${
    filter['order'] && filter['order'] == 'wishcount'
      ? `INNER JOIN ys_customer_wishlist cw ON cw.product_id = p.product_id`
      : ''
  }
  WHERE 1 = 1`
    let completed = `SELECT count(DISTINCT p.product_id) as count   FROM ys_product p 
    LEFT JOIN ys_product_description pd ON pd.product_id = p.product_id
    LEFT JOIN oc_category_description cd ON p.category_id = cd.category_id
    LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
    LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
    LEFT JOIN oc_category c ON c.category_id = p.category_id
    LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
    LEFT JOIN ys_product_status ps ON ps.status_id = p.status
    WHERE 1 = 1`

    if (filter['category']) {
      sql += ` AND c.category_id = ${filter['category']}`
      completed += ` AND c.category_id = ${filter['category']}`
    }

    if (filter['category_ids'] && !filter['categoryOrManufcaturer']) {
      sql += ` AND c.category_id IN(${filter['category_ids']})`
      completed += ` AND c.category_id IN(${filter['category_ids']})`
    }

    if (filter['manufacturer_name']) {
      sql += ` AND m.name LIKE '%${filter['manufacturer_name']}%'`
    }

    if (filter['path']) {
      sql += ` AND cp.path_id IN (${filter['path']})`
      completed += ` AND cp.path_id IN (${filter['path']})`
    }

    if (filter['manufacturer'] && !filter['categoryOrManufcaturer']) {
      sql += ` AND p.manufacturer_id IN (${filter['manufacturer']})`
      completed += ` AND p.manufacturer_id IN (${filter['manufacturer']})`
    }

    if (filter['product_ids']) {
      sql += ` AND p.product_id IN (${filter['product_ids']})`
      completed += ` AND p.product_id IN (${filter['product_ids']})`
    }

    if(filter['wishlist']){
      sql += ` AND p.product_id IN (SELECT product_id FROM ys_customer_wishlist cw WHERE cw.customer_id = ${filter['wishlist']})`;
      completed += ` AND p.product_id IN (SELECT product_id FROM ys_customer_wishlist cw WHERE cw.customer_id = ${filter['wishlist']})`
    }

    if (filter['seller']) {
      sql += ` AND s.seller_id IN (${filter['seller']})`
      completed += ` AND s.seller_id IN (${filter['seller']})`
    }

    if (filter['name']) {
      sql += ` AND pd.name LIKE '%${escape(filter['name'])}%'`
      completed += ` AND pd.name LIKE '%${escape(filter['name'])}%'`
    }
    if (filter['mpn']) {
      sql += ` AND p.mpn = 1`
      completed += ` AND p.mpn = 1`
    }
    if (filter['image']) {
      if (filter['image'] == 0) {
        sql += ` AND (p.image IS NULL OR p.image='')`
        completed += ` AND (p.image IS NULL OR p.image='')`
      } else {
        sql += ` AND (p.image IS NOT NULL OR p.image != '')`
        completed += ` AND (p.image IS NOT NULL OR p.image != '')`
      }
    }
    if (filter['quantity']) {
      sql += ` AND p.quantity=${filter['quantity']}`
      completed += ` AND p.quantity=${filter['quantity']}`
    }
    if (filter['price']) {
      sql += ` AND (p.price=${filter['price']} OR p.special=${filter['price']})`
      completed += ` AND (p.price=${filter['price']} OR p.special=${filter['price']})`
    }
    if (filter['sellername']) {
      sql += ` AND s.company LIKE '%${escape(filter['sellername'])}%'`
      completed += ` AND s.company LIKE '%${escape(filter['sellername'])}%'`
    }
    if (filter['status']) {
      sql += ` AND p.status=${filter['status']}`
      completed += ` AND p.status=${filter['status']}`
    }
    if (filter['categoryOrManufcaturer']) {
      sql += ` AND c.category_id IN(${filter['category_ids']})`
      sql += ` OR p.manufacturer_id IN (${filter['manufacturer']})`
    }

    const productCount = await query(completed)

    if (filter['order']) {
      switch (filter['order']) {
        case 'newest':
          sql += ' ORDER BY date_added'
          break
        case 'oldest':
          sql += ' ORDER BY date_added DESC'
          break
        case 'cartcount':
          sql += ` ORDER BY cartcount DESC`
          break
        case 'wishcount':
          sql += ` ORDER BY wishCount DESC`
          break
        case 'viewed':
          sql += ` ORDER BY p.viewed DESC`
          break
      }
    }

    sql += ` LIMIT ${filter['start']}, ${filter['limit']}`
    completed += ` LIMIT 1000`

    const results = await query(sql)
    let output = []

    if (!results) return []

    results.map(val => {
      output.push({
        isFollowing: val.isFollowing && val.isFollowing ? true : false,
        product_id: parseInt(val.product_id),
        status: parseInt(val.status),
        viewed: parseInt(val.viewed),
        wishCount: parseInt(val.wishCount),
        cartCount: parseInt(val.cartCount),
        name: val.name,
        model: val.model,
        price: parseFloat(val.price),
        quantity: parseInt(val.quantity),
        weight: parseInt(val.weight),
        special: parseFloat(val.special),
        discountRate: discountRate(val.price, val.special),
        product_status: val.product_status,
        date_added: val.date_added,
        date_modified: val.date_modified,
        image: generateImage(val.image),
        mpn: parseInt(val.mpn),
        rating: val.rating ? parseInt(val.rating) : 0,
        ratingCount: val.ratingCount ? parseInt(val.ratingCount) : 0,
        category_id: parseInt(val.category_id),
        category: val.category,
        category_path: val.category_path,
        manufacturer_id: val.manufacturer_id,
        manufacturer: val.manufacturer,
        manufacturer_seo: val.manufacturer_seo,
        seller_id: val.seller_id,
        seller: val.company,
        salePoint: val.prod,
        href: val.product_seo
      })
    })

    return {
      count: productCount && productCount[0].count ? productCount[0].count : 0,
      products: output
    }
  }

  async getProduct (param) {
    let sql = `SELECT p.product_id, p.sku, cd.category_id, p.status, ps.title as status_name, 
    ck.cargokey, ck.title as shipping_cargo, pd.name, p.price, p.special, 
    p.seller_id, p.tax_rate, p.weight, s.company as seller, s.seo as seller_seo, 
    p.model, p.quantity as quantity, p.image, p.mpn, p.quantity,p.manufacturer_id, m.name AS manufacturer,m.seo_url as 'manufacturer_seo',
     pd.description, cd.category_id, cd.name as category, cd.seo_url as category_seo, p.product_seo,
     (SELECT AVG(rr.rate) FROM ys_product_review rr WHERE rr.product_id = p.product_id) as rate,
     (SELECT COUNT(r.rate) FROM ys_product_review r WHERE r.product_id = p.product_id) as rateCount,
     (SELECT AVG(sr.rate) FROM ys_seller_review sr WHERE p.seller_id = sr.seller_id) as sellerRate
     FROM ys_product p
    LEFT JOIN ys_product_description pd ON pd.product_id = p.product_id
    LEFT JOIN oc_category_description cd ON cd.category_id = p.category_id
    LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
    LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
    LEFT JOIN ys_seller_shipment sss ON sss.seller_id = p.seller_id
    LEFT JOIN ys_cargokeys ck ON ck.cargokey = sss.cargokey
    LEFT JOIN ys_product_status ps ON ps.status_id = p.status`

    //if (parseInt(param) && parseInt(param) != 0) {
    if (param.length == 6) {
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
  async getProductsForAdmin (filter) {
    const categoryModel = new CategoriesModel()
    const products = await this.getProducts(filter)
    let newProducts = []
    products.map(val => {
      newProducts.push({
        category_path: categoryModel.getPathList({
          category_id: val.category_id
        })
      })
    })

    return products
  }
}
