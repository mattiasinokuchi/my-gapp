/*  This module contains endpoints to the database
    for the product parent page   */

import { pool } from '$lib/db';

//  Read all products
export const get = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const res = await pool.query(`
        SELECT id AS product_id, *
        FROM product_table`);
    return {
        body: res.rows
    };
};

//  Add a new product
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    const values = [
        data.get('product_name'),
        data.get('price'),
        data.get('delivery_interval')
    ];
    try {
        await pool.query(`
            INSERT INTO product_table(product_name, price, delivery_interval)
            VALUES($1, $2, $3)
            RETURNING *
        `, values);
        return {
            status: 303,
            headers: {
                location: '/product'
            }
        };
    } catch (error) {
        console.log(error)
    }
};
