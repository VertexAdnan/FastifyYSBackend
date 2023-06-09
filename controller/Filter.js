const FilterModel = require('../model/FilterModel');
const { replace, generateImage, parseIds } = require('../helper/String');

module.exports = class Filter extends FilterModel {
    async getFilter(path){
        return {
            prices: await this.getPrices(path),
            sellers: await this.getSellers(path),
            categories: await this.getCategories(path),
            manufacturers: await this.getManufacturers(path)
        }
    }

    async getFilterSeller(seller_id){
        return {
            prices: await this.getPricesSeller(seller_id),
            categories: await this.getCategoriesSeller(seller_id),
            manufacturers: await this.getManufacturersSeller(seller_id)
        }
    }

    async getFilterManufacturer(manufacturer_id){
        return {
            prices: await this.getPricesManufacturer(manufacturer_id),
            sellers: await this.getSellersManufacturer(manufacturer_id),
            categories: await this.getCategoriesManufacturer(manufacturer_id)
        }
    }

    async filterWishlist(customer_id){
        return await this.getFilterWishlist(customer_id);
    }
}