/*  This module contains endpoints to the database
    for getting product options for a customer   */

import { pool } from '$lib/db';

//  Reads all products
export const get = async (_) => {
    const res = await pool.query(`
        SELECT id AS product_id, *
        FROM product_table
        ORDER BY product_name ASC`
    );
    return {
        body: res.rows
    };
};
