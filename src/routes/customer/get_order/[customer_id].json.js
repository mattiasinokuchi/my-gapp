/*  This module contains endpoints to the database
    for getting orders for a customer   */

import { pool } from '$lib/db';

//  Reads all orders for a specific customer
export const get = async ({ params }) => {
    try {
        const { customer_id } = params;
        const res = await pool.query(`
            SELECT
                order_table.id AS order_id,
                product_name,
                TO_CHAR(start_date :: DATE, 'yyyy-mm-dd') AS start_date
            FROM order_table
            INNER JOIN product_table
            ON product_table.id = order_table.product_id
            WHERE customer_id = $1
            `, [customer_id]);
        return {
            body: res.rows
        }
    } catch (error) {
        console.log(error);
    }
}
