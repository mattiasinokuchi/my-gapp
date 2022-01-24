/*  This module contains endpoints to the database
    for adding a product to a customer   */

import { pool } from '$lib/db';

/*  Adds a customer order.
    Avoids string concatenating parameters into the
    query text directly to prevent sql injection    */
export const post = async (request) => {
    try {
        if (request.body.get('start_date')) {
            await pool.query(
                `INSERT INTO order_table(customer_id, product_id, start_date)
                VALUES($1, $2, $3)`,
                [
                    request.body.get('customer_id'),
                    request.body.get('product_id'),
                    request.body.get('start_date')
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO order_table(customer_id, product_id)
                VALUES($1, $2)`,
                [
                    request.body.get('customer_id'),
                    request.body.get('product_id')
                ]
            );
        }
        return {
            status: 303,
            headers: {
                location: request.headers.referer
            }
        };
    } catch (error) {
        console.log(error)
    }
};