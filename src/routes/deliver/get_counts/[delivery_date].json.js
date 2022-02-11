/*  This module contains endpoints to the database
    for the delivery page   */

import { pool } from '$lib/db';

//  Reads all orders
export const get = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        const res = await pool.query(`
            SELECT
                product_name,
                COUNT (order_table.product_id)
            FROM order_table
            INNER JOIN customer_table ON customer_table.id = order_table.customer_id
            INNER JOIN product_table ON product_table.id = order_table.product_id
            WHERE
                -- no time-out this day
                customer_id
                NOT IN (
                    SELECT customer_id
                    FROM time_out_table
                    WHERE ($1::DATE BETWEEN start_time::date AND end_time)
                )
            AND     
                -- not delivered this day
                order_table.id
                NOT IN (
                    SELECT order_id
                    FROM delivery_table
                    WHERE delivery_time::date = $1::DATE 
                )
            AND -- it is a delivery day...
                CASE
                    WHEN delivery_interval IS NULL  -- one-time orders...
                        THEN $1::DATE = start_date  -- ...are delivered on start_date...
                    ELSE    -- ...subscriptions are delivered...
                        MOD(($1::DATE - start_date), delivery_interval) = 0 -- ...when remainder is 0 days
                END
            GROUP BY product_name;
        `, [event.params.delivery_date]);
        return {
            body: res.rows
        }
    } catch (error) {
        console.log(error);
    }
}
