const mysql = require('mysql-await')
var string = require('sqlstring')

const query = async (sql, db = 1) => {
  let connection = null

  if (db == 1) {
    connection = mysql.createConnection({
      connectionLimit: 10,
      host: '193.31.116.5',
      user: 'yapisepeti2',
      password: 'JGysYVrWmhMwUX!2',
      database: 'yapisepeti',
      throwErrors: false
    })
  }

  if (db == 2) {
    connection = mysql.createConnection({
      connectionLimit: 10,
      host: '193.31.116.5',
      user: 'yapisepeti2',
      password: 'JGysYVrWmhMwUX!2',
      database: 'yapisepetitemp',
      throwErrors: false
    })
  }

  if (connection) {
    connection.on(`error`, err => {

      console.log(err)
      console.log(err.sqlMessage)
      console.error(`Connection error ${err.code}`)
    })
    const result = await connection.awaitQuery(sql)
    connection.awaitEnd()
    return result
  } else {
    return false;
  }
}

const escape = str => {
  return string.escape(str).replaceAll("'", '')
}

module.exports = {
  query: query,
  escape: escape
}
