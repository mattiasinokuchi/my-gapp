/*  This module contains endpoints to the database
    for removing a time-out from a customer   */

import { pool } from '$lib/db';

export const del = async (request) => {
    /*if (!request.locals.user) {
        return { status: 401 };
    }*/
    try {
        /*  Avoids string concatenating parameters into the
            query text directly to prevent sql injection    */
        await pool.query(`
            DELETE FROM time_out_table
            WHERE id = $1`,
            [request.params.time_out_id]
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