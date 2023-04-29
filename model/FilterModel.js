const { query, escape } = require('../lib/mysql')

module.exports = class ProductModel {
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
        WHERE s.seller_id = ${seller_id} AND p.status = 1 AND c.category_id IS NOT NULL LIMIT 25`;
        
        const data = await query(sql);

        if(!data) return []

        return data;
    }

    async getManufacturersSeller(seller_id){
        let sql = `SELECT DISTINCT p.manufacturer_id, m.name FROM oc_category c
        LEFT JOIN oc_category_description cd ON cd.category_id = c.category_id
        LEFT JOIN oc_category_path cp ON c.category_id = cp.category_id
        LEFT JOIN ys_product p ON c.category_id = p.category_id
        LEFT JOIN oc_manufacturer m ON m.manufacturer_id = p.manufacturer_id
        WHERE p.seller_id = ${seller_id} AND p.status = 1 AND m.manufacturer_id IS NOT NULL LIMIT 25`;

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