/*  This module contains endpoints to the database
    for the customers parent and child pages   */

import { pool } from '$lib/db';

//  Reads data for a specific customer
export const get = async ({ params }, request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        const { customer_id } = params;
        const res = await pool.query(`
            SELECT id AS customer_id, *
            FROM customer_table
            WHERE id = $1
            `, [customer_id]
        );
        return {
            body: res.rows[0]
        }
    } catch (error) {
        console.log(error);
    }
}

/*  Deletes a customer.
    Client instance must be used in transaction with PostgreSQL.
    Avoids string concatenating parameters into the
    query text directly to prevent sql injection    */
export const del = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        //  Delete customer time-out's
        await client.query(`
            DELETE
            FROM time_out_table
            WHERE customer_id = $1
            `, [request.params.customer_id]
        );
        //  Delete customer orders
        await client.query(`
            DELETE
            FROM order_table
            WHERE customer_id = $1
            `, [request.params.customer_id]
        );
        //  Delete customer deliveries
        await client.query(`
            DELETE
            FROM delivery_table
            WHERE customer_id = $1
            `, [request.params.customer_id]
        );
        //  Advance customers by decrementing their delivery orders
        await client.query(`
            UPDATE customer_table
            SET delivery_order = delivery_order - 1
            WHERE delivery_order >= ($1);
            `, [request.body.get('delivery_order')]
        );
        //  Delete customer in request
        await client.query(`
            DELETE
            FROM customer_table
            WHERE id = $1
            `, [request.params.customer_id]
        );
        await client.query('COMMIT');
        return {
            status: 303,
            headers: {
                location: '/customer'
            }
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
