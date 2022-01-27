/*  This module contains endpoints to the database
    for adding a subscription time-out for a customer   */

import { pool } from '$lib/db';

/*  Avoids string concatenating parameters into the
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
        await pool.query(
            `INSERT INTO time_out_table(customer_id, start_time, end_time)
                VALUES($1, $2, $3)`,
            [
                data.get('customer_id'),
                data.get('start_date'),
                data.get('end_date')
            ]
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