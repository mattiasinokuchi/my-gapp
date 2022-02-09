/*  This module contains endpoint to the database
    for the specific product page   */

import { pool } from '$lib/db';

//  Reads data for a specific product
export const get = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    } try {
        const res = await pool.query(`
            SELECT id AS product_id, *
            FROM product_table
            WHERE id = $1
            `, [event.params.product_id]
        );
        return {
            body: res.rows[0]
        }
    } catch (error) {
        console.log(error);
    }
}
