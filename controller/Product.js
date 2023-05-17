const {
  htmlEntities,
  replace,
  generateImage,
  parseIds,
  discountRate,
  removeTags
} = require('../helper/String')
const ProductModel = require('../model/ProductModel')
const CategoryModel = require('../model/CategoriesModel')

module.exports = class Product extends ProductModel {
  async getProductReviews(product_id) {
    const results = await this.getReviewsAll(product_id)

    let data = []

    const hideName = str => {
      if (!str) return ''

      str = str.split(' ')

      let first = str[0][1]
      let second = str[1][1]

      return `${first}**** ${second}****`
    }

    if (!results) return []

    results.map(val => {
      data.push({
        review_id: val.review_id,
        customer_id: val.customer_id,
        product_id: val.product_id,
        review: val.review,
        image: val.image,
        rate: val.rate,
        like: parseInt(val.like),
        dislike: parseInt(val.dislike),
        confirmed: val.confirmed,
        createdat: val.createdat,
        customer: val.showme ? val.customer : hideName(val.customer),
        seller: val.seller
      })
    })

    return data
  }

  async getQuestions(product_id) {
    const results = await this.getProductQuestions(product_id)
    let data = []

    const hideName = str => {
      if (!str) return ''

      str = str.split(' ')

      let first = str[0][1]
      let second = str[1][1]

      return `${first}**** ${second}****`
    }

    results.map(val => {
      data.push({
        customer_id: val.customer_id,
        customer: val.showme ? val.customer : hideName(val.customer),
        qa_id: val.qa_id,
        product_id: val.product_id,
        seller_id: val.seller_id,
        message_id: val.message_id,
        message: val.message,
        isreaded: val.isreaded,
        isanswer: val.isanswer,
        date_added: val.date_added
      })
    })

    return data
  }

  async getProductsMisc(type, page = 1, limit = 20) {
    const start = (page - 1) * limit
    let ids = []
    let product_ids = ''
    switch (type) {
      case 'discounted':
        ids = await this.getProductDiscounted(start, limit)
        break
      case 'topsold':
        ids = await this.getProductBySold(start, limit)
        break
      case 'mostviewed':
        ids = await this.getProductViewed(start, limit)
        break
      default:
        ids = await this.getProductBySold(start, limit)
        break
    }

    ids.map(value => {
      product_ids += value.product_id + ','
    })

    product_ids = product_ids.substring(0, product_ids.length - 1)

    const products = await this.getProducts({
      product_ids: product_ids
    })

    /*let returnData = []

    products.map(val => {
      returnData.push({
        product_id: parseInt(val.product_id),
        name: val.name,
        price: parseFloat(val.price),
        special: parseFloat(val.special),
        discountRate: discountRate(val.price, val.special),
        image: generateImage(val.image),
        mpn: parseInt(val.mpn),
        rating: val.rating ? parseInt(val.rating) : 0,
        ratingCount: val.ratingCount ? parseInt(val.ratingCount) : 0,
        category_id: parseInt(val.category_id),
        category: val.category,
        manufacturer_id: val.manufacturer_id,
        manufacturer: val.manufacturer,
        seller_id: val.seller_id,
        seller: val.company,
        href: val.product_seo
      })
    })*/

    return {
      error: false,
      response: products
    }
  }
  async getP(query = []) {
    let filter = []

    filter['limit'] = query.limit ? parseInt(query.limit) : 20

    if (query.page) {
      filter['start'] = (query.page - 1) * filter['limit']
    }

    if (query.path) {
      filter['path'] = parseInt(query.path)
    }

    if (query.fc) {
      filter['category'] = parseIds(query.fc)
    }

    if (query.fm) {
      filter['manufacturer'] = parseIds(query.fm)
    }

    if (query.name) {
      filter['name'] = query.name
    }

    if (query.seller) {
      filter['seller'] = parseIds(query.seller)
    }
    if (query.status) {
      filter['status'] = parseInt(query.status)
    }
    if (query.order) {
      filter['order'] = query.order
    }
    if (query.customer_id) {
      filter['customer_id'] = parseInt(query.customer_id)
    }


    const products = await this.getProducts(filter)
    /*
        let results = []
    
        products.map(val => {
          results.push({
            product_id: parseInt(val.product_id),
            name: val.name,
            price: parseFloat(val.price),
            special: parseFloat(val.special),
            discountRate: discountRate(val.price, val.special),
            image: generateImage(val.image),
            mpn: parseInt(val.mpn),
            rating: val.rating ? parseInt(val.rating) : 0,
            ratingCount: val.ratingCount ? parseInt(val.ratingCount) : 0,
            category_id: parseInt(val.category_id),
            category: val.category,
            manufacturer_id: val.manufacturer_id,
            manufacturer: val.manufacturer,
            seller_id: val.seller_id,
            seller: val.company,
            href: val.product_seo
          })
        })
    */
    return {
      products: products
    }
  }
  async getProd(param) {

    let data = await this.getProduct(param)

    if (data && data[0]) {
      data = data[0]

      const options = await this.getOptions(parseInt(data.product_id))
      const images = await this.getImages(parseInt(data.product_id))
      console.log(parseInt(data.product_id))
      let productImages = []

      images.map(value => {
        productImages.push({
          product_image_id: value.product_image_id,
          image: generateImage(value.image)
        })
      })

      const returnData = {
        product_id: parseInt(data.product_id),
        sku: data.sku,
        product_href: data.product_seo,
        category_id: parseInt(data.category_id),
        status: parseInt(data.status),
        status_name: data.status_name,
        cargokey: data.cargokey ? data.cargokey : undefined,
        shipping_cargo: data.shipping_cargo ? data.shipping_cargo : undefined,
        name: data.name,
        price: data.price.toFixed(2),
        special: data.special ? data.special.toFixed(2) : 0,
        discountRate: discountRate(data.price, data.special),
        seller_id: data.seller_id,
        tax_rate: parseInt(data.tax_rate),
        weight: parseFloat(data.weight),
        seller: data.seller,
        seller_href: data.seller_seo,
        model: data.model,
        quantity: parseInt(data.quantity),
        image: generateImage(data.image),
        images: productImages,
        mpn: data.mpn ? parseInt(data.mpn) : 0,
        manufacturer_id: data.manufacturer_id
          ? parseInt(data.manufacturer_id)
          : 0,
        manufacturer: data.manufacturer ? data.manufacturer : undefined,
        manufacturer_seo: data.manufacturer_seo,
        description: htmlEntities(data.description),
        category: data.category,
        category_href: data.category_seo,
        rate: data.rate ? parseInt(data.rate) : 0,
        rateCount: data.rateCount ? parseInt(data.rateCount) : 0,
        options: options
      }

      return {
        error: false,
        response: returnData
      }
    }

    return {
      error: true,
      response: 'Ürün bulunamadı'
    }
  }
  async getProdForAdmin(query = []) {
    let filter = []

    filter['limit'] = query.limit ? parseInt(query.limit) : 20
    query.page = query.page ? query.page : 1
    if (query.page) {
      filter['start'] = (query.page - 1) * filter['limit']
    }

    if (query.quantity) {
      filter['quantity'] = parseInt(query.quantity)
    }

    if (query.fc) {
      filter['category'] = parseIds(query.fc)
    }

    if (query.price) {
      filter['price'] = parseInt(query.price)
    }

    if (query.name) {
      filter['name'] = query.name
    }
    if (query.sellername) {
      filter['sellername'] = query.sellername
    }
    if (query.status) {
      filter['status'] = query.status
    }
    if (query.seller) {
      filter['seller'] = parseIds(query.seller)
    }
    if (query.image) {
      filter['image'] = query.image
    }
    const products = await this.getProducts(filter)
    if (products) {

      return { error: false, response: products }
    }
    return {
      error: true,
      response: 'Ürünler bulunamadı'
    }

  }
  addP(data) {
    console.log(`User adds product`)
    const product_name = replace(data.name)

    return {
      result: product_name + ' ADDED'
    }
  }
}
