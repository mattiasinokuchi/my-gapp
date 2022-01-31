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
    console.log(data.get('delivery_date'));
    console.log(data.get('billing_date'));
    console.log(data.get('delivery_id'));
    try {
        /*  Avoids string concatenating parameters into the
            query text directly to prevent sql injection    */
        await pool.query(`
            UPDATE
                delivery_table
            SET
                delivery_time = $1,
                billing_date = NULLIF ($2::text, '')::date
            WHERE
                id = $3;
            `,
            [
                data.get('delivery_date'),
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
