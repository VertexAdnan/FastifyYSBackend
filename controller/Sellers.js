const SellerModel = require('../model/SellerModel')

module.exports = class Sellers extends SellerModel {
    async gSellers(filter = []){
        return await this.getSellers(filter);
    }

    async gSeller(path){
        return await this.getSeller(path);
    }
}