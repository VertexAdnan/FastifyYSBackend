const SellerModel = require('../model/SellerModel')

module.exports = class Sellers extends SellerModel {
    async gSellers(filter = []){
        return this.getSellers(filter);
    }
}