/*  This module contains endpoints to the
    database for the delivery page   */

import { pool } from '$lib/db';

//  Reads all phone numbers for customers to be delivered
export const get = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const res = await pool.query(`
    SELECT
        DISTINCT telephone  -- no duplicate phone numbers
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
    AND -- it is a delivery day...
        CASE
            WHEN delivery_interval IS NULL  -- one-time orders...
                THEN $1::DATE = start_date  -- ...are delivered on start_date...
            ELSE    -- ...subscriptions are delivered...
                MOD(($1::DATE - start_date), delivery_interval) = 0 -- ...when remainder is 0 days
        END;
`, [event.params.delivery_date]);
    let str = '';
    for (let index = 0; index < res.rows.length; index++) {
        str += res.rows[index].telephone + ' ';
    }
    return {
        body: [{ numbers: str }]
    };
};
