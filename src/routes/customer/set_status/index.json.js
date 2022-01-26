/*  This module contains an endpoint to the database
    for changing subscription status of a customer   */

import { pool } from '$lib/db';

//  Update customer subscription status
export const post = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const values = [
        request.body.get('subscribe'),
        request.body.get('customer_id')
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
                location: request.headers.referer
            }
        };
    } catch (error) {
        console.log(error)
    }
};
