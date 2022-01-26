/*  This module contains endpoints to the
    database for the specific product page   */

import { pool } from '$lib/db';

//  Update a product
export const post = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
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
                request.body.get('product_name'),
                request.body.get('price'),
                request.body.get('delivery_interval'),
                request.body.get('product_id')
            ]
        );
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
