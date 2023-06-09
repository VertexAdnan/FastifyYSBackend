const SellerModel = require('../model/SellerModel')

module.exports = class Sellers extends SellerModel {
    async gSellers(filter = []){
        return await this.getSellers(filter);
    }

    async gSeller(path, customer_id = 0){
        return await this.getSeller(path, customer_id);
    }
}