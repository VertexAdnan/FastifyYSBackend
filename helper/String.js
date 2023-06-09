const replaceStrings = string => {
  string.replace('ü', 'u')

  return string
}

const htmlEntities = encodedString => {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g
  var translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>'
  }
  return encodedString
    .replace(translate_re, function (match, entity) {
      return translate[entity]
    })
    .replace(/&#(\d+);/gi, function (match, numStr) {
      var num = parseInt(numStr, 10)
      return String.fromCharCode(num)
    })
}

const removeTags = str => {
  if (str === null || str === '') return false
  else str = str.toString()

  return str.replace(/(<([^>]+)>)/gi, '')
}

const generateImage = (path, width = 250, height = 250) => {
  return `https://cdn.yapisepeti.com.tr/image/s_${width}x${height}/${path}`
}

const generateUrl = path => {}

const parseIds = (ids, seperator = ',') => {
  const idsArr = ids.split(seperator)

  let returns = ''
  for (let i = 0; i < idsArr.length; i++) {
    returns += `${parseInt(idsArr[i]) ? parseInt(idsArr[i]) : ''},`
  }

  while (returns[returns.length - 1] == ',') {
    returns = returns.substring(0, returns.length - 1)
  }

  return returns
}

const discountRate = (price, special) => {
  const discountRate = special ? ((price - special) * 100) / price : 0

  return discountRate < 0 ? 0 : parseInt(discountRate)
}

const getCategoryIcon = category_id => {
  let icon
  switch (category_id) {
    case '1069':
      icon = '1069.png'
      break
    case '1071':
      icon = '1071.png'
      break
    case '1072':
      icon = '1072.png'
      break
    case '1073':
      icon = '1073.png'
      break
    case '1074':
      icon = '1074.png'
      break
    default:
      icon = 'default.png'
      break
  }

  icon = 'https://yapisepeti.com.tr/' + icon

  return icon
}

const number_format = (number, decimals, decPoint, thousandsSep) => {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
  const n = !isFinite(+number) ? 0 : +number
  const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  const sep = typeof thousandsSep === 'undefined' ? ',' : thousandsSep
  const dec = typeof decPoint === 'undefined' ? '.' : decPoint
  let s = ''
  const toFixedFix = function (n, prec) {
    if (('' + n).indexOf('e') === -1) {
      return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
    } else {
      const arr = ('' + n).split('e')
      let sig = ''
      if (+arr[1] + prec > 0) {
        sig = '+'
      }
      return (+(
        Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) +
        'e-' +
        prec
      )).toFixed(prec)
    }
  }
  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}

module.exports = {
  replace: replaceStrings,
  generateImage: generateImage,
  parseIds: parseIds,
  discountRate: discountRate,
  getCategoryIcon: getCategoryIcon,
  htmlEntities: htmlEntities,
  removeTags: removeTags,
  number_format: number_format
}
