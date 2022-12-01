/*  This module contains endpoint to the database
    for the parent delivery page   */

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
                product_name,
                quantity,
                COUNT (product_name),
                CASE    -- delivery date for...
                    WHEN delivery_interval IS NULL  -- one-time orders...
                        THEN TO_CHAR(start_date, 'yyyy-mm-dd')  -- ...are at the start_date...
                    ELSE    -- ...delivery date for subscriptions are calculated by...
                        TO_CHAR(
                            CURRENT_DATE -- ...todays date...
                            + index*delivery_interval -- ...added to a serial number multiplied with the delivery interval...
                            - MOD(    -- ...substracted by the remainder (days since last delivery)...
                                CURRENT_DATE - start_date,  -- ...after division of days since delivery started...
                                delivery_interval), -- ...by the delivery interval (remainder is 0 on delivery days)...
                        'yyyy-mm-dd')   -- ...converted to a date string...
                END delivery_date
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
            WHERE   -- date is due
                CASE WHEN delivery_interval IS NULL   -- one-time orders
                    THEN
                        customer_id IN (
                            SELECT customer_id
                            FROM order_table
                        )
                    ELSE    -- subscriptions
                        CURRENT_DATE + index*delivery_interval - MOD(CURRENT_DATE - start_date, delivery_interval)  -- delivery date (see above)
                        >= start_date
                        AND
                        CURRENT_DATE + index*delivery_interval - MOD(CURRENT_DATE - start_date, delivery_interval)  -- delivery date (see above)
                        >= CURRENT_DATE
                END
            AND -- no time-out on delivery day...
                CASE WHEN delivery_interval IS NULL   --  ...for one-time orders...
                    THEN
                        customer_id NOT IN (
                            SELECT customer_id
                            FROM time_out_table
                            WHERE
                                order_table.start_date BETWEEN time_out_table.start_time AND time_out_table.end_time
                        )
                    ELSE -- ...or subscriptions
                        customer_id NOT IN (
                            SELECT customer_id
                            FROM time_out_table
                            WHERE
                                CURRENT_DATE + index*delivery_interval - MOD(CURRENT_DATE - start_date, delivery_interval)  -- delivery date (see above)
                                BETWEEN time_out_table.start_time AND time_out_table.end_time            
                        )
                END
            AND -- not delivered
                order_table.id
                    NOT IN (
                        SELECT order_id
                        FROM delivery_table
                        WHERE delivery_time::date = (CURRENT_DATE + index*delivery_interval  - MOD(CURRENT_DATE - start_date, delivery_interval)) 
                    )
            AND
                -- delivery within 90 days (to prevent products with shorter delivery interval being replaced by products with longer interval)
                CASE
                    -- for one-time orders to be present (and not being counted 90 times)
                    WHEN index = 0
                        THEN index*delivery_interval < 90 OR delivery_interval IS NULL
                    ELSE
                    index*delivery_interval < 90
                    END
            GROUP BY
                quantity,
                product_name,
                delivery_date
            ORDER BY
                product_name;
            `);
        const deliveriesSortedByDate = res.rows.sort((a, b) => {
            return new Date(a.delivery_date) - new Date(b.delivery_date)
        });
        //  Group deliveries by date
        const deliveriesGroupedByDate = deliveriesSortedByDate.reduce((acc, obj) => {
            if (acc.find(
                accObject => accObject.delivery_date === obj.delivery_date
            )) {
                const index = acc.findIndex(
                    accObject => accObject.delivery_date === obj.delivery_date
                );
                acc[index].deliveries.push({
                    product_name: obj.product_name,
                    count: obj.count,
                    quantity: obj.quantity
                });
            } else {
                acc.push({
                    delivery_date: obj.delivery_date,
                    deliveries: [{
                        product_name: obj.product_name,
                        count: obj.count,
                        quantity: obj.quantity
                    }]
                });
            }
            return acc;
        }, []);

        return {
            body: deliveriesGroupedByDate
//            body: res.rows
        }
    } catch (error) {
        console.log(error);
    }
}
