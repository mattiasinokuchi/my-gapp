/*  This module contains endpoint to the database
    for the specific customers page   */

import { pool } from '$lib/db';

//  Generate deliveries
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
                CASE    -- delivery date for...
                    WHEN delivery_interval IS NULL  -- one-time orders...
                        THEN TO_CHAR(start_date, 'yyyy-mm-dd')  -- ...are delivered at start_date...
                    ELSE    -- ...delivery date for subscriptions are calculated by...
                        TO_CHAR(
                            CURRENT_DATE -- ...todays date...
                            + index*delivery_interval -- ...added to a serial number multiplied with the delivery interval...
                            - MOD(    -- ...substracted by the remainder (days since last delivery)...
                                CURRENT_DATE - start_date,  -- ...after division of days since delivery started...
                                delivery_interval), -- ...by the delivery interval (remainder is 0 on delivery days)...
                        'yyyy-mm-dd')   -- ...converted to a date string...
                END
                AS delivery_date
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
            CROSS JOIN
                generate_series(0,89) AS index
            WHERE
                -- subscription is activated
                customer_table.active = 'true'
            AND
                -- no time-out on selected day...
                CASE
                    WHEN delivery_interval IS NULL THEN -- ...for one-time orders...
                        customer_id
                            NOT IN (
                                SELECT customer_id
                                FROM time_out_table
                                WHERE (start_date BETWEEN start_time::date AND end_time)
                            )
                    ELSE -- ...or subscriptions
                        customer_id
                            NOT IN (
                                SELECT customer_id
                                FROM time_out_table
                                WHERE ((CURRENT_DATE + index*delivery_interval) BETWEEN start_time::date AND end_time)
                            )
                END
            AND     
                -- not delivered
                order_table.id
                    NOT IN (
                        SELECT order_id
                        FROM delivery_table
                        WHERE delivery_time::date = (CURRENT_DATE + index*delivery_interval) 
                    )
            AND
                -- delivery within 90 days (to prevent products with shorter delivery interval being replaced by products with longer interval)
                CASE
                    -- for one-time orders to be present (and not be counted 90 times)
                    WHEN index = 0
                        THEN index*delivery_interval < 90 OR delivery_interval IS NULL
                    ELSE
                    index*delivery_interval < 90
                END
            LIMIT 1;
        `);
        return {
            body: res.rows[0]
        }
    } catch (error) {
        console.log(error);
    }
}
