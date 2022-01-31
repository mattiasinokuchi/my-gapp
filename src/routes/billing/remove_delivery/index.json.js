/*  This module contains endpoints to the
    database for the billing page   */

import { pool } from '$lib/db';

//  Remove a delivery
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
            DELETE FROM delivery_table
            WHERE id = $1;
            `, [data.get('delivery_id')]
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
