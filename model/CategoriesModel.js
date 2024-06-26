const { query, escape } = require('../lib/mysql')

module.exports = class CategoriesModel {
  async getCategoryInformation(path){
    let sql = `SELECT * FROM oc_category c LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id WHERE cd.seo_url = '${escape(path)}' LIMIT 1`
    const results = await query(sql);

    if(!results[0].category_id){
      return []
    }

    let breadSql = `SELECT c.category_id, cd.name, cd.seo_url FROM oc_category c LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id WHERE cp.path_id = ${results[0].category_id} AND c.category_id != ${results[0].category_id} ORDER BY c.category_id ASC `;

    let parentBread = `SELECT cd.category_id, cd.name, cd.seo_url FROM oc_category_path cp LEFT JOIN oc_category_description cd ON cd.category_id = cp.path_id WHERE cp.category_id = ${results[0].category_id} AND cd.category_id != ${results[0].category_id} ORDER BY level DESC LIMIT 1`

    const breadcumbs = await query(breadSql);
    const parent = await query(parentBread);

    results[0]['breadcumbs'] = breadcumbs;
    results[0]['parent_bread'] = parent ? parent[0] : {};
    
    return (results[0] ? results[0] : results);
  }
  async getCategories(filter = []) {
    let sql = `SELECT c.category_id, cd.name, cd.seo_url
        FROM oc_category c
        LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id`

    if (filter['name']) {
      sql += ` WHERE cd.name LIKE '%${escape(filter['name'])}%'`
    }

    sql += ` LIMIT ${filter.start}, ${filter.limit}`

    return await query(sql)
  }

  async getMainMenu() {
    let sql = `SELECT c.category_id, cd.name, cd.seo_url FROM oc_category c
        LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id WHERE c.category_id IN (1073, 1069, 1071, 1072, 1074, 1077, 3508)`

    return await query(sql)
  }

  async getPathList(filter = []) {
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
        AND cd2.name IS NOT NULL
        AND c.parent_id IS NOT NULL
`

    if (filter['name']) {
      sql += ` AND cd2.name LIKE '%${escape(filter['name'])}%'`
    }

    if (filter['category_id']) {
      sql += ` AND c.parent_id = '${filter['category_id']}'`
    }

    if (filter['path_id']) {
      sql += ` AND c.parent_id IN (SELECT category_id FROM oc_category_path cpp2 WHERE cpp2.path_id = ${filter['path_id']})`
    }

    sql += `    ORDER BY c.parent_id ASC
            LIMIT ${filter['start']}, ${filter['limit']}`
    return await query(sql)
  }
}
