/*  This module contains endpoints to the database
    for adding a subscription time-out for a customer   */

import { pool } from '$lib/db';

/*  Avoids string concatenating parameters into the
    query text directly to prevent sql injection    */
export const post = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        await pool.query(
            `INSERT INTO time_out_table(customer_id, start_time, end_time)
                VALUES($1, $2, $3)`,
            [
                request.body.get('customer_id'),
                request.body.get('start_date'),
                request.body.get('end_date')
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