/*  This module contains endpoints to the database
    for countings to delivery child pages   */

import { pool } from '$lib/db';

//  Reads all orders
export const get = async (_) => {
    try {
        const res = await pool.query(`
            SELECT
                product_name,
                COUNT (product_name)
            FROM
                order_table
            INNER JOIN
                product_table
            ON
                product_table.id = order_table.product_id
            INNER JOIN
                customer_table
            ON
                customer_table.id = order_table.customer_id
            WHERE
                customer_table.active = 'true'
            AND
                -- no time-out on selected day
                customer_id
                NOT IN (
                    SELECT customer_id
                    FROM time_out_table
                    WHERE (CURRENT_DATE BETWEEN start_time::date AND end_time)
                )
            AND     
                -- not delivered
                order_table.id
                NOT IN (
                    SELECT order_id
                    FROM delivery_table
                    WHERE delivery_time::date = CURRENT_DATE 
                )
            AND
                -- selected day is a delivery day
                MOD((CURRENT_DATE - start_date),delivery_interval) = 0 
            GROUP BY
                product_name;
        `);
        return {
            body: res.rows
        }
    } catch (error) {
        console.log(error);
    }
}
