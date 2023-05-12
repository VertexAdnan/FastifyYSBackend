const os = require("os");
const cluster = require("cluster");

const fastify = require('fastify')({
  logger: false
})

const getProduct = require('./controller/Product')
const filter = require('./controller/Filter')
const category = require('./controller/Categories')
const manufacturers = require('./controller/Manufacturers')
const sellers = require('./controller/Sellers')
const template = require('./controller/Template')
const Template = require('./controller/Template')

const clusterWorkerSize = os.cpus().length;

fastify.register(require('@fastify/cors'), {
  hook: 'preHandler',
  delegator: (req, callback) => {
    const corsOptions = {
      // This is NOT recommended for production as it enables reflection exploits
      origin: true
    };

    // do not include CORS headers for requests from localhost
    if (/^localhost$/m.test(req.headers.origin)) {
      corsOptions.origin = false
    }   
    if (/^193.31.116.20$/m.test(req.headers.origin)) {
      corsOptions.origin = false
    }

    // callback expects two parameters: error and options
    callback(null, corsOptions)
  },
})



// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ app: true })
})

// TEMPLATE ROUTES
fastify.get('/template/getHomeCategories', async (req, res) => {
  const Template = new template()

  const results = await Template.getHomePageCategories();

  return results
})

fastify.get('/template/extrasBanners', async (req, res) => {
  const Template = new template()

  const results = await Template.getExtraPages();

  return results
})

fastify.get('/template/extrasSpecials', async (req, res) => {
  const Template = new template()

  const results = await Template.getExtrasSpecials(req.query);

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
fastify.get('/getProducts', async (req, res) => {
  const product = new getProduct()

  return await product.getP(req.query)
})
fastify.get('/getProductsAdmin', async (req, res) => {
  const products = new getProduct()
  return await products.getProdForAdmin(req.query)
})

fastify.get('/getProduct/:param', async (req, res) => {
  const product = new getProduct()

  return await product.getProd(req.params.param)
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

fastify.get('/getManufacturers', async (req, res) => {
  const Manufacturer = new manufacturers()

  const page = req.query.page ? parseInt(req.query.page) : 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 100
  const name = req.query.name ? req.query.name : 0
  return await Manufacturer.getManufacturers({
    name: name,
    start: (page - 1) * limit,
    limit: limit
  })
})

fastify.get('/getManufacturer/:manufacturer_id', async(req, res) => {
  const Manufacturer = new manufacturers();
  const id = req.params.manufacturer_id;

  return await Manufacturer.getManufacturer(id);
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
  const template = new Template();
  const results = template.getSixBanners(req.query)
  return results
})
fastify.post('/template/updateSixBanner', (req, res) => {
  const template = new Template();
  const body = req.body
  return template.updateSixBanner(body)
})


// Run the server!
const start = async () => {
  try {
      await fastify.listen({ port: 27015, host: '0.0.0.0' });
      console.log(`server listening on ${fastify.server.address().port} and worker ${process.pid}`);
  } catch (err) {
      fastify.log.error(err);
      process.exit(1);
  }
}

if (clusterWorkerSize > 1) {
  if (cluster.isMaster) {
      for (let i=0; i < clusterWorkerSize; i++) {
          cluster.fork();
      }

      cluster.on("exit", function(worker) {
          console.log("Worker", worker.id, " has exited.")
      })
  } else {
      start();
  }
} else {
  start();
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
