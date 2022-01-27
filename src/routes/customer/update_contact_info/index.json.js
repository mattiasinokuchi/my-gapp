/*  This module contains endpoints to the
    database for the specific customer page   */

import { pool } from '$lib/db';

//  Update customer information
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
                data.get('first_name'),
                data.get('last_name'),
                data.get('street_address'),
                data.get('postcode'),
                data.get('city'),
                data.get('telephone'),
                data.get('email'),
                data.get('customer_id')
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
