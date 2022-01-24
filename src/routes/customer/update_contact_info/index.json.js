/*  This module contains endpoints to the
    database for the specific customer page   */

import { pool } from '$lib/db';

//  Update customer information
export const post = async (request) => {
    try {
        /*  Avoids string concatenating parameters into the
            query text directly to prevent sql injection    */
        await pool.query(`
            UPDATE
                customer_table
            SET
                first_name = $1,
                last_name = $2,
                street_address = $3,
                postcode = $4,
                city = $5,
                telephone = $6,
                email = $7
            WHERE
                id = $8
            `,
            [
                request.body.get('first_name'),
                request.body.get('last_name'),
                request.body.get('street_address'),
                request.body.get('postcode'),
                request.body.get('city'),
                request.body.get('telephone'),
                request.body.get('email'),
                request.body.get('customer_id')
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
