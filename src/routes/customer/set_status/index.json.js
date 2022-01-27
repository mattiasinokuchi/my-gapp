/*  This module contains an endpoint to the database
    for changing subscription status of a customer   */

import { pool } from '$lib/db';

//  Update customer subscription status
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    const values = [
        data.get('subscribe'),
        data.get('customer_id')
    ];
    try {
        /*  Avoids string concatenating parameters into the
            query text directly to prevent sql injection    */
        await pool.query(`
            UPDATE customer_table
            SET active = ($1)
            WHERE id = ($2)
            RETURNING *
            `, values
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
