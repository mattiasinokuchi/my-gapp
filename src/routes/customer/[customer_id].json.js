/*  This module contains endpoints to the database
    for the customers parent and child pages   */

import { pool } from '$lib/db';

//  Reads data for a specific customer
export const get = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        const res = await pool.query(`
            SELECT id AS customer_id, *
            FROM customer_table
            WHERE id = $1
            `, [request.params.customer_id]
        );
        return {
            body: res.rows[0]
        }
    } catch (error) {
        console.log(error);
    }
}
