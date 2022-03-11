/*  This module contains the endpoint to the
    database for the billing page   */

import { pool } from '$lib/db';

//  Set the billing date where it is missing
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
                billing_date = CURRENT_DATE
            WHERE
                billing_date IS NULL AND
                customer_id = $1;
            `, [data.get('customer_id')]
        );
        return {
            status: 303,
            headers: {
                location: '/billing/'
            }
        };
    } catch (error) {
        console.log(error)
    }
};
