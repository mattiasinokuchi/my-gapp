/*  This module contains endpoints to the database
    for delivery child pages   */

import { pool } from '$lib/db';

//  Read deliveries made today
export const get = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        const res = await pool.query(`
            SELECT
                delivery_time
            FROM delivery_table
            WHERE delivery_time :: DATE = CURRENT_DATE;
        `);
        return {
            body: res.rows
        }
    } catch (error) {
        console.log(error);
    }
}
