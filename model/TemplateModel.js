const {query, escape} = require('../lib/mysql');
const ProductModel = require('./ProductModel')

const {parseIds} = require('../helper/String');

module.exports = class TemplateModel {
    async extraPages(){
        let sql = `SELECT
        ( SELECT banner FROM ys_extras_specials LIMIT 1 ) AS banner_3,
        ( SELECT banner FROM ys_smile_in_basket_page LIMIT 1 ) AS banner_2,
        ( SELECT banner FROM ys_extra_page LIMIT 1 ) AS banner_1,
        ( SELECT banner FROM ys_extras_shipping_free LIMIT 1 ) AS banner_4`;

        const results = await query(sql, 2);

        return results;
    }
    async extrasSpecials(filter = []){
        let sql = `SELECT * FROM ys_extras_specials WHERE extra_id = ${filter['extra_id'] ? filter['extra_id'] : 1}`
        const page = await query(sql, 2);

        sql = `SELECT product_id FROM ys_product WHERE viewed > 50 AND status = 1 ORDER BY viewed, soldcount DESC LIMIT ${filter['start']},${filter['limit']}`;
        const product_ids = await query(sql);

        let ids = '';
        product_ids.map( (val) => {
            ids += `${val.product_id},`
        })

        const productmodel = new ProductModel();
        const products = await productmodel.getProducts({
            product_ids: parseIds(ids)
        })

        return {
            page: page[0],
            products: products
        }
    }
    async extrasShippingFree(filter = []){
        let sql = `SELECT GROUP_CONCAT(product_id) as product_ids FROM ys_extras_shipping_free_items`
        const product_ids = await query(sql, 2);
        const productmodel = new ProductModel();

        const products = await productmodel.getProducts({
            product_ids: product_ids[0].product_ids
        })


        const pageData = await query(`SELECT * FROM ys_extras_shipping_free`, 2);

        return {
            page: pageData[0],
            products: products
        }
    }
    async getSmileInBasket(filter = []){
        let sql = `SELECT * FROM ys_smile_in_basket_page p LEFT JOIN ys_smile_in_basket_items i ON p.extra_id = i.extra_id`
        const results = await query(sql, 2);

        let page = []
        let banners = []
        //let products = []
      
        let category_ids = ''
        results.map(val => {
          category_ids += `${val.category_id},`
      
          page.push({
            extra_id: val.extra_id,
            banner: val.banner,
            background_image: val.background_image,
            background_hex: val.background_hex
          })
      
          banners.push({
            item_id: val.item_id,
            extra_id: val.extra_id,
            image: val.image,
            title: val.title,
            link: val.link
          })
        })
      
        const product_ids = await query(`SELECT SUBSTRING_INDEX(GROUP_CONCAT(p.product_id), ',', 5) as product_ids FROM ys_product p LEFT JOIN oc_category_path cp ON p.category_id = cp.category_id WHERE cp.path_id IN (${parseIds(category_ids)}) LIMIT 5`);
      
        const productmodel = new ProductModel();

        const products = await productmodel.getProducts({
            product_ids: product_ids.product_ids
        });

        return {
            page: page,
            banners: banners,
            products: products
        };
    }
    async addSmileinBasketItem(data){
        let sql = `INSERT INTO ys_smile_in_basket_items SET extra_id = '${data.extra_id}', image = '${data.image}', title = '${data.title}', link = '${data.link}', category_id = '${data.category_id}'`

        return await query(sql, 2);
    }
    async addExtraItem(data){
        let sql = `INSERT INTO ys_extra_items SET extra_id = '${data.extra_id}', image = '${data.image}', title = '${data.title}', link = '${data.link}'`;

        return await query(sql, 2);
    }
    async removeExtraItem(item_id){
        let sql = `DELETE FROM ys_extra_items WHERE item_id = ${item_id}`

        return await query(sql, 2);
    }
    async getExtraPage(){
        let sql = `SELECT * FROM ys_extra_page eg LEFT JOIN ys_extra_items ei ON eg.extra_id = ei.extra_id WHERE ei.item_id IS NOT NULL`;
        const results = await query(sql, 2);

        let page = [];
        let banners = [];
        results.map( (val) => {
            page.push({
                extra_id: val.extra_id,
                banner: val.banner,
                background_image: val.background_image,
                background_hex: val.background_hex
            })

            banners.push({
                item_id: val.item_id,
                extra_id: val.extra_id,
                image: val.image,
                title: val.title,
                link: val.link
            })
        })

        return {
            page: page[0],
            banners: banners
        }
    }
    async getSpecialPage(filter = []){
        let sql = `SELECT msp.*, spi.item_id, spi.value, spi.url, ppt.type_id, ppt.type FROM ys_main_special_pages msp
        LEFT JOIN ys_special_pages_items spi ON spi.page_id = msp.page_id
        LEFT JOIN ys_special_pages_types ppt ON ppt.type_id = spi.type_id
        WHERE spi.page_id = '${filter['page_id']}'
        OR msp.link = '${filter['page_id']}'`;
  
        const results = await query(sql, 2);

        let product_ids = '';
        let manufacturer_ids = '';
        let category_ids = '';
        let seller_ids = '';
        let banners = [];

        if(!results) return {
            products: [],
            banners: []
        }

        results.map( (val) => {
            if(val.type == 'Product') product_ids += `${val.value},`;
            if(val.type == 'Manufacturer') manufacturer_ids += `${val.value},`;
            if(val.type == 'Category') category_ids += `${val.value};`
            if(val.type == 'Seller') seller_ids += `${val.value};`

            if(val.type == 'Banner'){
                banners.push(val.value);
            }
        })

        const productModel = new ProductModel();

        const products = await productModel.getProducts({
            product_ids: (product_ids.length > 0 ? parseIds(product_ids) : false),
            manufacturer: (manufacturer_ids.length > 0 ? parseIds(manufacturer_ids) : false),
            path: (category_ids.length > 0 ? parseIds(category_ids) : false),
            seller: (seller_ids.length > 0 ? parseIds(seller_ids) : false)
        });
        
        return {
            products: products,
            banners: banners
        }
    }
    async getSliders(title_id = 0, slider_id = 0, status){
        let sql = `SELECT * FROM ys_sliders_temp st
        LEFT JOIN ys_sliders_title_temp stt ON st.title_id = stt.title_id
        WHERE stt.title_id IS NOT NULL`

        if(title_id){
            sql += ` AND st.title_id = ${title_id}`
        }

        if(slider_id){
            sql += ` AND st.slider_id = ${slider_id}`
        }

        sql += ` AND st.status = ${status}`

        return await query(sql, 2);
    }

    async updateSlider(data){
        let sql = `UPDATE ys_sliders_temp SET title_id = ${data.title_id}, data = '${JSON.stringify(data.data)}' WHERE slider_id = ${data.slider_id}`;

        return await query(sql, 2);
    }

    async getSliderTitles(title_id = 0){
        let sql = `SELECT * FROM ys_sliders_title_temp`;

        if(title_id){
            sql += ` WHERE title_id = ${title_id}`
        }

        return await query(sql, 2);
    }

    async updateTitles(data){
        let sql = `UPDATE ys_sliders_title_temp SET title = '${data.title}' WHERE title_id = ${data.title_id}`;

        return await query(sql, 2);
    }
}