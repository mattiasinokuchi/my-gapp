/*  This module contains endpoints to the database
    for adding a product to a customer   */

import { pool } from '$lib/db';

/*  Adds a customer order.
    Avoids string concatenating parameters into the
    query text directly to prevent sql injection    */
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    try {
        if (data.get('start_date')) {
            await pool.query(
                `INSERT INTO order_table(customer_id, product_id, quantity, start_date)
                VALUES($1, $2, $3, $4)`,
                [
                    data.get('customer_id'),
                    data.get('product_id'),
                    data.get('quantity'),
                    data.get('start_date')
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO order_table(customer_id, product_id, quantity)
                VALUES($1, $2, $3)`,
                [
                    data.get('customer_id'),
                    data.get('product_id'),
                    data.get('quantity'),
                ]
            );
        }
        return {
            status: 303,
            headers: {
                location: `/customer/${data.get('customer_id')}`
            }
        };
    } catch (error) {
        console.log(error)
    }
};