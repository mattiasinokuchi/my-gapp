/*  This module contains endpoints to the
    database for the customers parent page   */

import { pool } from '$lib/db';

//  Reads all customers
export const get = async (_) => {
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
export const post = async (request) => {
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
                    delivery_order)
            VALUES
                ($1,$2,$3,$4,$5,$6,$7,(
                    -- last number of customers
                    SELECT COUNT(*) + 1
                    FROM customer_table))
            RETURNING *`,
            [
                request.body.get('first_name'),
                request.body.get('last_name'),
                request.body.get('street_address'),
                request.body.get('postcode'),
                request.body.get('city'),
                request.body.get('telephone'),
                request.body.get('email')
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
