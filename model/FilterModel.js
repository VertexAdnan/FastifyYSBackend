const { query, escape } = require('../lib/mysql')

module.exports = class ProductModel {
    async getFilterMisc(manufacturer_ids = 0, category_ids = 0, product_ids = 0, seller_ids){
        let sqlManufacturers = `SELECT DISTINCT m.manufacturer_id, m.name FROM oc_manufacturer m WHERE m.manufacturer_id IN (${manufacturer_ids})`
        let sqlCategories = `SELECT DISTINCT c.category_id, cd.name FROM oc_category c LEFT JOIN oc_category_description cd ON c.category_id = cd.category_id WHERE c.category_id IN (${category_ids})`
        let sqlSellers = `SELECT DISTINCT s.seller_id, s.company FROM ys_seller s LEFT JOIN ys_product p ON p.seller_id = s.seller_id WHERE s.seller_id IN (${seller_ids})`
        //let sqlProducts = `SELECT DISTINCT p.product_id, pd`

        let sqlCategoriesP = `SELECT DISTINCT c.category_id, cd.name FROM ys_product p 
        LEFT JOIN oc_category c ON p.category_id = c.category_id 
        LEFT JOIN oc_category_description ON c.category_id = cd.category_id
        WHERE p.product_id IN (${product_ids})`;

        let sqlManufacturersP = `SELECT DISTINCT m.manufacturer_id, m.name FROM oc_manufacturer m
        LEFT JOIN ys_product p ON p.manufacturer_id = m.manufacturer_id
        WHERE p.product_id IN (${product_ids})`

        let data = [];
        if(manufacturer_ids){
            data.push({
                manufacturers: await query(sqlManufacturers),
            })
        } else {
            data['manufacturers'] = [];
        }

        if(category_ids){
            data.push({
                categories: await query(sqlCategories)
            })
        } else {
            data['categories'] = [];
        }

        if(product_ids){
            data.push({
                categories: await query(sqlCategoriesP),
                manufacturers: await query(sqlManufacturersP)
            })
        }

        return data
    }

    // Manufacturer Filter
    async getSellersManufacturer(mid){
        let sql = `SELECT DISTINCT p.seller_id, s.company FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
        WHERE p.manufacturer_id = ${mid} AND p.status = 1 LIMIT 25`;

        const data = await query(sql);

        if(!data) return []

        return data;
    }

    async getCategoriesManufacturer(mid){
        let sql = `SELECT DISTINCT c.category_id, cd.name FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        WHERE p.manufacturer_id = ${mid} AND p.status = 1 AND c.category_id IS NOT NULL LIMIT 25`;
        
        const data = await query(sql);

        if(!data) return []

        return data;
    }
    
    async getPricesManufacturer(mid){
        let sql = `SELECT DISTINCT MIN(p.price) as min_price, MAX(p.price) as max_price FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        WHERE p.manufacturer_id = ${mid} AND p.status = 1`;

        const data = await query(sql);
        const returns = {
            min: (data[0] && data[0].min_price ? parseFloat((data[0].min_price).toFixed(2)) : 0),
            max: (data[0] && data[0].max_price ? parseFloat((data[0].max_price).toFixed(2)) : 0)
        }
        return returns;
    }
    // Manufacturer Filter

    // Seller Filter
    async getCategoriesSeller(seller_id){
        let sql = `SELECT DISTINCT c.category_id, cd.name FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        WHERE p.seller_id = ${seller_id} AND p.status = 1 AND c.category_id IS NOT NULL LIMIT 25`;
        
        const data = await query(sql);

        if(!data) return []

        return data;
    }

    async getManufacturersSeller(seller_id){
        let sql = `SELECT DISTINCT
        p.manufacturer_id,
        m.NAME 
    FROM
        oc_manufacturer m
        LEFT JOIN ys_product p ON p.manufacturer_id = m.manufacturer_id 
    WHERE
        p.seller_id = ${seller_id} 
        AND p.STATUS = 1 
        AND m.manufacturer_id IS NOT NULL 
        LIMIT 25`;

        const data = await query(sql);

        if(!data) return [];

        return data;
    }

    async getPricesSeller(seller_id){
        let sql = `SELECT DISTINCT MIN(p.price) as min_price, MAX(p.price) as max_price FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        WHERE p.seller_id = ${seller_id} AND p.status = 1`;

        const data = await query(sql);
        const returns = {
            min: (data[0] && data[0].min_price ? parseFloat((data[0].min_price).toFixed(2)) : 0),
            max: (data[0] && data[0].max_price ? parseFloat((data[0].max_price).toFixed(2)) : 0)
        }
        return returns;
    }

    // Seller Filter
    
    async getCategories(path){
        let sql = `SELECT DISTINCT c.category_id, cd.name FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        WHERE cp.path_id = ${path} AND p.status = 1 LIMIT 25`;

        const data = await query(sql);

        return data;
    }

    async getManufacturers(path){
        let sql = `SELECT DISTINCT p.manufacturer_id, m.name FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON c.category_id = p.category_id
        LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
        WHERE cp.path_id = ${path} AND p.status = 1 LIMIT 25`;

        const data = await query(sql);

        return data;
    }

    async getPrices(path){
        let sql = `SELECT DISTINCT MIN(p.price) as min_price, MAX(p.price) as max_price FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        WHERE cp.path_id = ${path} AND p.status = 1`;

        const data = await query(sql);
        const returns = {
            min: (data[0] && data[0].min_price ? parseFloat((data[0].min_price).toFixed(2)) : 0),
            max: (data[0] && data[0].max_price ? parseFloat((data[0].max_price).toFixed(2)) : 0)
        }
        return returns;
    }

    async getSellers(path){
        let sql = `SELECT DISTINCT p.seller_id, s.company FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON p.category_id = c.category_id
        LEFT JOIN ys_seller s ON s.seller_id = p.seller_id
        WHERE cp.path_id = ${path} AND p.status = 1 LIMIT 25`;

        const data = await query(sql);

        return data;
    }
}