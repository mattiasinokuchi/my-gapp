/*  This module contains endpoints to the
    database for the customers parent page   */

import { pool } from '$lib/db';

//  Reads all customers
export const get = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const res = await pool.query(`
        SELECT id AS customer_id, *
        FROM customer_table
        ORDER BY delivery_order ASC`
    );
    return {
        body: res.rows
    };
};

//  Adds a new customer
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
            INSERT INTO
                customer_table(
                    first_name,
                    last_name,
                    street_address,
                    postcode,
                    city,
                    telephone,
                    email,
                    notes,
                    place_of_delivery,
                    delivery_order
                )
            VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,(
                    -- last number of customers
                    SELECT COUNT(*) + 1
                    FROM customer_table))
            RETURNING *`,
            [
                data.get('first_name'),
                data.get('last_name'),
                data.get('street_address'),
                data.get('postcode'),
                data.get('city'),
                data.get('telephone'),
                data.get('email'),
                data.get('place_of_delivery'),
                data.get('notes')
            ]
        );
        return {
            status: 303,
            headers: {
                location: '/customer'
            }
        };
    } catch (error) {
        console.log(error)
    }
};
