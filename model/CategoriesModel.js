const { query, escape } = require('../lib/mysql')

module.exports = class CategoriesModel {
  async getCategories (filter = []) {
    let sql = `SELECT c.category_id, cd.name, cd.seo_url
        FROM oc_category c
        LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id`

    if (filter['name']) {
      sql += ` WHERE cd.name LIKE '%${escape(filter['name'])}%'`
    }

    sql += ` LIMIT ${filter.start}, ${filter.limit}`

    return await query(sql)
  }

  async getMainMenu () {
    let sql = `SELECT c.category_id, cd.name, cd.seo_url FROM oc_category c
        LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id WHERE c.category_id IN (1073, 1069, 1071, 1072, 1074, 1077, 3508)`

    return await query(sql)
  }

  async getPathList (filter = []) {
    let sql = `SELECT DISTINCT
        c.parent_id,
        cc.percent,
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
        WHERE c.category_id IS NOT NULL
`

    if (filter['name']) {
      sql += ` AND cd2.name LIKE '%${escape(filter['name'])}%'`
    }

    if (filter['category_id']) {
      sql += ` AND c.parent_id = '${filter['category_id']}'`
    }

    sql += `    ORDER BY c.parent_id ASC
            LIMIT ${filter['start']}, ${filter['limit']}`

    return await query(sql)
  }
}
