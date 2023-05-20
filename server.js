const os = require('os')
const cluster = require('cluster')

const fastify = require('fastify')({
  logger: false
})

const fastifyCookie = require('fastify-cookie')
const { RedisStore } = require('@mgcrea/fastify-session-redis-store')
const fastifySession = require('@mgcrea/fastify-session')
const Redis = require('ioredis')
//import { IS_PROD, IS_TEST, REDIS_URI, SESSION_TTL } from "./config/env";

const SESSION_TTL = 864e3 // 1 day in seconds

const getProduct = require('./controller/Product')
const filter = require('./controller/Filter')
const category = require('./controller/Categories')
const manufacturers = require('./controller/Manufacturers')
const sellers = require('./controller/Sellers')
const template = require('./controller/Template')
const Template = require('./controller/Template')
//const Product = require("./controller/Product");

const clusterWorkerSize = os.cpus().length

/*fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  store: new RedisStore({ client: new Redis('redis://localhost/'), ttl: SESSION_TTL }),
  secret: "abcdefghjrtrwdfdvcxvdsfsefsdfsefqa",
  cookie: { maxAge: SESSION_TTL },
  secure: true,
  saveUninitialized: true,
  name: 'YAPISEPETI',

});*/

// create by specifying host
//fastify.register(require('@fastify/redis'), { host: '127.0.0.1' })

// OR by specifying Redis URL
fastify.register(require('@fastify/redis'), {
  url: 'redis://127.0.0.1' /* other redis options */
})

// OR with more options
/*fastify.register(require('@fastify/redis'), { 
  host: '127.0.0.1', 
  port: 6379, // Redis port
  family: 4   // 4 (IPv4) or 6 (IPv6)
})*/

fastify.register(require('@fastify/cors'), {
  hook: 'preHandler',
  delegator: (req, callback) => {
    const corsOptions = {
      // This is NOT recommended for production as it enables reflection exploits
      origin: true
    }

    // do not include CORS headers for requests from localhost
    if (/^localhost$/m.test(req.headers.origin)) {
      corsOptions.origin = false
    }
    if (/^193.31.116.20$/m.test(req.headers.origin)) {
      corsOptions.origin = false
    }

    // callback expects two parameters: error and options
    callback(null, corsOptions)
  }
})

fastify.get('/sessionset', async (req, res) => {
  const { redis } = fastify

  redis.set('test', 'ezbirevle')
  return { set: true }
})

fastify.get('/session', async (req, res) => {
  const { redis } = fastify
  //redis.set('paths', null)
  const test = await redis.get('paths')
  return { get: test }
})

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ app: true })
})

// TEMPLATE ROUTES
fastify.get('/template/getHomeCategories', async (req, res) => {
  const Template = new template()

  const results = await Template.getHomePageCategories()

  return results
})

fastify.get('/template/extrasBanners', async (req, res) => {
  const Template = new template()

  const results = await Template.getExtraPages()

  return results
})

fastify.get('/template/extrasSpecials', async (req, res) => {
  const Template = new template()

  const results = await Template.getExtrasSpecials(req.query)

  return results
})

fastify.get('/template/extrasShippingFree', async (req, res) => {
  const Template = new template()

  const results = await Template.getExtrasShippingFree(req.body)

  return results
})

fastify.get('/template/smileInBasket', async (req, res) => {
  const Template = new template()

  const results = await Template.smileInBasket(req.body)

  return results
})

fastify.post('/template/smileInBasket/addItem', async (req, res) => {
  const Template = new template()

  const results = await Template.addItemsSmileInBasket(req.body)

  return results
})

fastify.post('/template/extraPage/addItem', async (req, res) => {
  const Template = new template()

  const results = await Template.addItemsExtra(req.body)

  return results
})

fastify.post('/template/extraPage/removeItem/:item_id', async (req, res) => {
  const Template = new template()

  const results = await Template.removeItemExtra(req.params.item_id)

  return results
})

fastify.get('/template/extraPage', async (req, res) => {
  const Template = new template()

  const results = await Template.ysExtra(req.query)

  return results
})

fastify.get('/template/getSpecialPage/:page', async (req, res) => {
  const Template = new template()
  let d = req.params.page

  const results = Template.getSpecialPageData(d)

  return results
})

fastify.post('/template/updateSliders', async (req, res) => {
  const Template = new template()

  const data = await Template.updateSliders(req.body)

  return data
})

fastify.get('/template/sliderTitles', async (req, res) => {
  const Template = new template()

  const data = await Template.getTitles(req.query)

  return data
})

fastify.post('/template/updateTitles', async (req, res) => {
  const Template = new template()

  const data = await Template.updateTitle(req.body)

  return data
})

fastify.get('/template/getSliders', async (req, res) => {
  const Template = new template()

  const data = await Template.sliders(req.query)

  return data
})
// TEMPLATE ROUTES

// PRODUCT ROUTES
fastify.get('/getProductsCookieCategory', async (req, res) => {
  const { redis } = fastify
  let paths = await redis.get('paths')

  let results

  if (paths) {
    while (paths[paths.length - 1] == ',') {
      paths = paths.slice(0, -1)
    }

    const Products = new getProduct()
    results = await Products.getP({
      category_ids: paths
    })

    return results
  } else {
    console.log('Cookie yok!')
    results = await products.getProductsMisc('topsold')
  }

  return results
})

fastify.get('/getProductsCookieProducts', async (req, res) => {
  const { redis } = fastify
  let product_ids = await redis.get('products')

  let results

  if (product_ids) {
    while (product_ids[product_ids.length - 1] == ',') {
      product_ids = product_ids.slice(0, -1)
    }

    const Products = new getProduct()
    results = await Products.getP({
      product_ids: product_ids
    })

    return results
  } else {
    console.log('Cookie yok!')
    results = await products.getProductsMisc('mostviewed')
  }

  return results
})

fastify.get('/getProducts', async (req, res) => {
  const { redis } = fastify

  if (!redis.get('paths')) {
    redis.set('paths', `${req.query.path}`)
  } else {
    const oldPath = await redis.get('paths')
    redis.set('paths', `${req.query.path},${oldPath}`)
  }

  const product = new getProduct()

  return await product.getP(req.query)
})

fastify.get('/getProductsAdmin', async (req, res) => {
  const products = new getProduct()
  return await products.getProdForAdmin(req.query)
})

fastify.get('/getProduct/:param', async (req, res) => {
  const product = new getProduct()
  const param = req.params.param

  const { redis } = fastify

  const productData = await product.getProd(param)

  if (productData) {
    if (!redis.get('products')) {
      redis.set('products', `${productData.product_id}`)
    } else {
      const oldParam = await redis.get('products')
      redis.set('products', `${productData.product_id},${oldParam}`)
    }
  }

  return productData
})

fastify.get('/getProductsSpecial/:type', async (req, res) => {
  const products = new getProduct()

  const page = req.query.page ? parseInt(req.query.page) : 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 20
  return await products.getProductsMisc(req.params.type, page, limit)
})

fastify.get('/product/getQuestions/:product_id', async (req, res) => {
  const product = new getProduct()
  const product_id = req.params.product_id

  const reviews = await product.getQuestions(product_id)

  return reviews
})

fastify.get('/product/reviews/:product_id', async (req, res) => {
  const product = new getProduct()
  const product_id = req.params.product_id

  const reviews = await product.getProductReviews(product_id)

  return reviews
})

fastify.get('/getSellers', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 100
  const page = req.query.page ? parseInt(req.query.page) : 1
  const start = (page - 1) * limit
  const name = req.query.name ? req.query.name : 0

  const Sellers = new sellers()

  const results = await Sellers.gSellers({
    start: start,
    limit: limit,
    name: name
  })

  return results
})

fastify.get('/seller/getInformation/:path', async (req, res) => {
  const path = req.params.path

  const Sellers = new sellers()

  const results = await Sellers.gSeller(path)

  return results
})

fastify.get('/getManufacturers', async (req, res) => {
  const Manufacturer = new manufacturers()

  const page = req.query.page ? parseInt(req.query.page) : 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 100
  const name = req.query.name ? req.query.name : 0

  const date = req.query.date ? req.query.date : 0
  const seller_id = req.query.seller ? parseInt(req.query.seller) : 0
  const manufacturer_id = req.query.manufacturer_id
    ? parseInt(req.query.manufacturer_id)
    : 0
  const seller = req.query.seller ? req.query.seller : 0

  return await Manufacturer.getManufacturers({
    name: name,
    start: (page - 1) * limit,
    limit: limit,
    date: date,
    seller: seller,
    seller_id: seller_id,
    manufacturer_id: manufacturer_id
  })
})

fastify.get('/getManufacturer/:manufacturer_id', async (req, res) => {
  const Manufacturer = new manufacturers()
  const id = req.params.manufacturer_id

  return await Manufacturer.getManufacturer(id)
})

fastify.get('/manufacturer/getInformation/:path', async (req, res) => {
  const Manufacturer = new manufacturers()
  const path = req.params.path

  const data = await Manufacturer.getWithPath(path)

  return data
})

fastify.get('/getCategoryInformation/:seo', async (req, res) => {
  const Category = new category()

  const results = await Category.getInformation(req.params.seo)

  return results
})

fastify.get('/getCategories', async (req, res) => {
  const Categories = new category()

  const results = await Categories.getCats(req.query)

  return results
})

fastify.get('/getCategoriesList', async (req, res) => {
  const Categories = new category()

  const results = await Categories.getLists(req.query)

  return results
})

fastify.get('/getCategoriesMain', async (req, res) => {
  const Categories = new category()

  const results = await Categories.getMains()

  return results
})

fastify.get('/getFilter', async (req, res) => {
  const Filter = new filter()
  if (!req.query.path)
    return {
      error: true,
      response: 'Path bulunamadı!'
    }

  const results = await Filter.getFilter(req.query.path)

  return results
})

fastify.get('/getFilterManufacturer', async (req, res) => {
  const Filter = new filter()
  if (!req.query.manufacturer)
    return {
      error: true,
      response: 'Marka bulunamadı!'
    }

  const results = await Filter.getFilter(req.query.manufacturer)

  return results
})

fastify.get('/getFilterSeller', async (req, res) => {
  const Filter = new filter()
  if (!req.query.seller_id)
    return {
      error: true,
      response: 'Seller_id bulunamadı!'
    }

  const results = await Filter.getFilterSeller(req.query.seller_id)

  return results
})

fastify.post('/addProduct', (req, res) => {
  if (!req.body.name) {
    return {
      error: true,
      response: 'Ürün adı yok!'
    }
  }

  let data = []

  data['name'] = req.body.name

  const product = new getProduct()

  return product.addP(data)
})

fastify.get('/template/getTripleBanner', (req, res) => {
  const template = new Template()
  return template.getTripleBanners(req.query)
})
fastify.get('/template/getTripleBannerItems/:seo', (req, res) => {
  const template = new Template()
  let filter = req.query ? req.query : []

  filter.seo = req.params.seo

  const results = template.getTripleBannerItems(filter)
  return results
})
fastify.post('/template/updateTripleBanner', (req, res) => {
  const template = new Template()
  const data = req.body
  return template.updateTripleBanner(data)
})
fastify.get('/template/getSixBanners', (req, res) => {
  const template = new Template()
  const results = template.getSixBanners(req.query)
  return results
})
fastify.post('/template/updateSixBanner', (req, res) => {
  const template = new Template()
  const body = req.body
  return template.updateSixBanner(body)
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 27016, host: '0.0.0.0' })
    console.log(
      `server listening on ${fastify.server.address().port} and worker ${
        process.pid
      }`
    )
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

if (clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for (let i = 0; i < clusterWorkerSize; i++) {
      cluster.fork()
    }

    cluster.on('exit', function (worker) {
      console.log('Worker', worker.id, ' has exited.')
    })
  } else {
    start()
  }
} else {
  start()
}

// Run the server!
/*fastify.listen({ port: 27015, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
  console.log('Server started on ' + address)
})*/
