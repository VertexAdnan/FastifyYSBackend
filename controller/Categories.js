const CategoriesModel = require('../model/CategoriesModel')
const {getCategoryIcon} = require('../helper/String')

module.exports = class Categories extends CategoriesModel {
    async getCats(query){
        const limit = (query.limit ? query.limit : 100);
        const page = (query.page ? query.page : 1);
        const start = (page - 1) * limit;

        const results = await this.getCategories({
            start: start,
            limit: limit,
            name: (query.name ? query.name : 0)
        });

        return {
            error: false,
            categories: results
        };
    }

    async getMains(){
        const categories = await this.getMainMenu();

        let data = [];

        categories.map( (value) => {
            data.push({
                category_id: value.category_id,
                name: value.name,
                icon_svg: `https://www.yapisepeti.com.tr/iconcat.svg`,
                icon_png: `https://www.yapisepeti.com.tr/iconcat.png`,
                href: value.seo_url
            })
        })

        return data;
    }

    async getLists(query){
        const limit = (query.limit ? query.limit : 100);
        const page = (query.page ? query.page : 1);
        const start = (page - 1) * limit;
        const name = (query.name ? query.name : 0)
        const category_id = (query.category_id ? query.category_id : 0)

        const data = await this.getPathList({
            limit: limit,
            page: page,
            start: start,
            name: name,
            category_id: category_id
        });

        if(!data) return {}

        let results = [];
        data.map( (val) => {
            results.push({
                category_id: val.parent_id,
                commission: (val.percent ? val.percent : 0),
                name: val.path
            })
        })

        return results;
    }
}