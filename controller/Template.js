const TemplateModel = require('../model/TemplateModel')

module.exports = class Template extends TemplateModel {
  async getHomePageCategories() {
    return this.getCategories();
  }
  async getExtraPages() {
    const results = await this.extraPages()

    return [
      {
        banner: results[0].banner_1
      },
      {
        banner: results[0].banner_2
      },
      {
        banner: results[0].banner_3
      },
      {
        banner: results[0].banner_4
      }
    ]
  }

  async getExtrasSpecials(query = []) {
    const limit = query.limit ? parseInt(query.limit) : 20
    const page = query.page ? parseInt(query.page) : 1
    const start = (page - 1) * limit

    return this.extrasSpecials({
      limit: limit,
      start: start
    })
  }
  async getExtrasShippingFree(query) {
    return this.extrasShippingFree(query)
  }
  async smileInBasket(body) {
    const results = await this.getSmileInBasket(body)

    return results
  }
  async addItemsSmileInBasket(body) {
    if (!body.extra_id)
      return {
        error: true,
        response: 'Extra id bulunamadı'
      }

    if (!body.image)
      return {
        error: true,
        response: 'Görsel bulunamadı'
      }

    if (!body.title)
      return {
        error: true,
        response: 'Başlık bulunamadı!'
      }

    if (!body.link)
      return {
        error: true,
        response: 'Link bulunamadı'
      }

    if (!body.category_id)
      return {
        error: true,
        response: 'Kategori bulunamadı'
      }

    const add = await this.addSmileinBasketItem(body)

    if (!add)
      return {
        error: true,
        response: 'Başarısız'
      }

    return {
      error: false,
      response: 'Başarıyla eklendi'
    }
  }

  async addItemsExtra(body) {
    if (!body.extra_id)
      return {
        error: true,
        response: 'Extra id bulunamadı'
      }

    if (!body.image)
      return {
        error: true,
        response: 'Görsel bulunamadı'
      }

    if (!body.title)
      return {
        error: true,
        response: 'Başlık bulunamadı!'
      }

    if (!body.link)
      return {
        error: true,
        response: 'Link bulunamadı'
      }

    const add = await this.addExtraItem(body)

    if (!add)
      return {
        error: true,
        response: 'Başarısız'
      }

    return {
      error: false,
      response: 'Başarılı'
    }
  }
  async removeItemExtra(item_id) {
    const remove = await this.removeExtraItem(item_id)
    return {
      error: false,
      response: 'Başarılı'
    }
  }
  async ysExtra(query) {
    const limit = query.limit ? parseInt(query.limit) : 20
    const page = query.page ? parseInt(query.page) : 1
    const start = (page - 1) * limit

    const filter = {
      limit: limit,
      start: start
    }

    return this.getExtraPage()
  }
  async getSpecialPageData(query) {
    const results = this.getSpecialPage({
      page_id: query,
      link: query
    })

    return results
  }

  async updateTitle(body) {
    if (!body.title_id)
      return {
        error: true,
        response: 'ID Bulunamadı'
      }

    if (!body.title)
      return {
        error: true,
        response: 'Geçersiz isim'
      }

    const update = this.updateTitles({
      title_id: body.title_id,
      title: body.title
    })

    if (!update)
      return {
        error: true,
        response: 'Başarısız'
      }

    return {
      error: false,
      response: 'Başarılı'
    }
  }
  async getTitles(query) {
    const title_id = query.title_id ? parseInt(query.title_id) : 0

    const results = await this.getSliderTitles(title_id)

    return results
  }

  async sliders(query) {
    const title_id = query.title_id ? parseInt(query.title_id) : 0
    const slider_id = query.slider_id ? parseInt(query.slider_id) : 0
    const status = query.status ? parseInt(query.status) : 1

    const sliders = await this.getSliders(title_id, slider_id, status)

    let results = []
    sliders.map(val => {
      results.push({
        slider_id: val.slider_id,
        title_id: val.title_id,
        title: val.title,
        status: val.status,
        data: JSON.parse(val.data)
      })
    })

    return results
  }

  async updateSliders(body) {
    if (!body.slider_id)
      return {
        error: true,
        response: 'ID Bulunamadı'
      }

    if (!body.title_id)
      return {
        error: true,
        response: 'Başlık Bulunamadı'
      }
    const data =
      typeof body.data == 'object' ? body.data : JSON.stringify(body.data)

    if (
      !data.slider ||
      !data.titlefirst ||
      !data.button_link ||
      !data.button_name ||
      !data.slider_icon ||
      !data.titlesecond ||
      //!data.background_color ||
      !data.titlefirst_color ||
      //!data.slider_background ||
      !data.titlesecond_color ||
      !data.titlefirst_fontsize ||
      !data.titlesecond_fontsize
    )
      return {
        error: true,
        response: 'Eksik Veri!'
      }
    const update = await this.updateSlider({
      slider_id: body.slider_id,
      title_id: body.title_id,
      data: data
    })

    if (!data)
      return {
        error: true,
        response: 'Güncelleme başarısız'
      }

    return {
      error: false,
      response: 'Başarıyla güncellendi!'
    }
  }

  async updateTripleBanner(body) {
    if (!body.tbanner_id) {
      return {
        error: true,
        response: 'Banner id alanı zorunludur'
      }
    }
    const update = await this.updateOneTripleBanner(body)
    if (update) {
      return {
        error: false,
        response: 'Banner bilgisi güncellendi'
      }
    }
    return {
      error: false,
      response: 'Banner bilgisi güncellenemedi'
    }

  }
  async getTripleBanners(body) {
    let tbanner_id = body.tbanner_id ? body.tbanner_id : 0
    return await this.getTripleBanner(tbanner_id)
  }
  async getTripleBannerItems(body) {
    if (!body.seo) {
      return {
        error: true,
        response: 'Banner seo alanı zorunludur'
      }
    }

    const results = await this.getTripleBannerItem(body)
    return results
  }
  async getSixBanners(body) {
    let sbanner_id = body.sbanner_id ? body.sbanner_id : 0
    const results = await this.getSixBanner(sbanner_id)
    return results
  }
  async updateSixBanner(body) {

    if (!body.sbanner_id) {
      return {
        error: true,
        response: 'Banner id alanı zorunludur'
      }
    }
    if (!body.banner) {
      return {
        error: true,
        response: 'Banner resmi zorunludur'
      }
    }
    if (!body.link) {
      return {
        error: true,
        response: 'Link alanı zorunludur'
      }
    }
    const result = await this.updateOneSixBanner(body)
    if (result) {
      return {
        error: false,
        response: 'Banner güncellendi'
      }
    }
    return {
      error: true,
      response: 'Banner güncellenemedi'
    }
  }




}
