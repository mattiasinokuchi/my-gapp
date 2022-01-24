/*  This module contains endpoint to the database
    for the specific product page   */

import { pool } from '$lib/db';

//  Reads data for a specific customer
export const get = async ({ params }) => {
    try {
        const { product_id } = params;
        const res = await pool.query(`
            SELECT id AS product_id, *
            FROM product_table
            WHERE id = $1
            `, [product_id]
        );
        return {
            body: res.rows[0]
        }
    } catch (error) {
        console.log(error);
    }
}
