/*  'pg' is a CommonJS module which may not support named exports.
    Import is done via the default export instead  */

import pkg from 'pg';

const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres.dodlckdovwnmjwgpwoii',
  host: process.env.SUPABASE_HOST,
  database: 'postgres',
  password: process.env.SUPABASE_PASSWORD,
  port: process.env.SUPABASE_PORT
});

/*module.exports = {
  query: (text, params, callback) => {
    const start = Date.now()
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start
      console.log('executed query', { text, duration, rows: res.rowCount })
      callback(err, res)
    })
  },
}*/
