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
                customer_table.id AS customer_id,
                order_table.id AS order_id, *
            FROM order_table
            INNER JOIN customer_table ON customer_table.id = order_table.customer_id
            INNER JOIN product_table ON product_table.id = order_table.product_id
            WHERE
                customer_table.active = 'true'
            AND
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
            ORDER BY delivery_order ASC;
        `, [event.params.delivery_date]);
        //  Group orders by customer
        const ordersByCustomer = res.rows.reduce((acc, obj) => {
            if (acc.find(
                accObject => accObject.customer_id === obj.customer_id
            )) {
                const index = acc.findIndex(
                    accObject => accObject.customer_id === obj.customer_id
                );
                acc[index].orders.push({
                    order_id: obj.order_id,
                    product_name: obj.product_name,
                    product_id: obj.product_id,
                    price: obj.price,
                    start_date: obj.start_date,
                    delivery_interval: obj.delivery_interval
                });
            } else {
                acc.push({
                    customer_id: obj.customer_id,
                    first_name: obj.first_name,
                    last_name: obj.last_name,
                    place_of_delivery: obj.place_of_delivery,
                    street_address: obj.street_address,
                    city: obj.city,
                    orders: [{
                        order_id: obj.order_id,
                        product_name: obj.product_name,
                        product_id: obj.product_id,
                        price: obj.price,
                        start_date: obj.start_date,
                        delivery_interval: obj.delivery_interval
                    }]
                });
            }
            return acc;
        }, []);
        return {
            body: ordersByCustomer
        }
    } catch (error) {
        console.log(error);
    }
}
