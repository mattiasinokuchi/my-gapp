/*  This module contains endpoints to the
    database for the billing page   */

import { pool } from '$lib/db';

//  Update a billing
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
                delivery_table
            SET
                delivery_time = $1,
                price = $2,
                quantity = $3,
                delivery_comment = $4,
                billing_date = NULLIF ($5::text, '')::date
            WHERE
                id = $6;
            `,
            [
                data.get('delivery_date'),
                data.get('price'),
                data.get('quantity'),
                data.get('delivery_comment'),
                data.get('billing_date'),
                data.get('delivery_id')
            ]
        );
        return {
            status: 303,
            headers: {
                location: `/billing/`
            }
        };
    } catch (error) {
        console.log(error)
    }
};
