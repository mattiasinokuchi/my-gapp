/*  This module contains endpoints to the
    database for the specific product page   */

import { pool } from '$lib/db';

//  Update a product
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
            UPDATE
                product_table
            SET
                product_name = $1,
                price = $2,
                delivery_interval = (NULLIF ($3::text, '')::integer)
            WHERE
                id = $4;
            `,
            [
                data.get('product_name'),
                data.get('price'),
                data.get('delivery_interval'),
                data.get('product_id')
            ]
        );
        return {
            status: 303,
            headers: {
                location: `/product/${data.get('product_id')}`
            }
        };
    } catch (error) {
        console.log(error)
    }
};
