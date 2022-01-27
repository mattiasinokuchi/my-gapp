/*  This module contains endpoints to the database
    for removing a product from a customer   */

import { pool } from '$lib/db';

//  Deletes a customer order
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    try {
        /*  Avoids string concatenating parameters into the
            query text directly to prevent sql injection    */
        await pool.query(`
            DELETE FROM order_table
            WHERE id = $1`,
            [data.get('order_id')]
        );
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