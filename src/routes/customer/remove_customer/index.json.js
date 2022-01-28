/*  This module contains endpoint to the database
    for the specific customers page   */

import { pool } from '$lib/db';

/*  Deletes a customer
    Client instance must be used in transaction with PostgreSQL.    */
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        //  Delete customer time-out's
        await client.query(`
            DELETE
            FROM time_out_table
            WHERE customer_id = $1
            `, [data.get('customer_id')]
        );
        //  Delete customer orders
        await client.query(`
            DELETE
            FROM order_table
            WHERE customer_id = $1
            `, [data.get('customer_id')]
        );
        //  Delete customer deliveries
        await client.query(`
            DELETE
            FROM delivery_table
            WHERE customer_id = $1
            `, [data.get('customer_id')]
        );
        //  Advance customers by decrementing their delivery orders
        await client.query(`
            UPDATE customer_table
            SET delivery_order = delivery_order - 1
            WHERE delivery_order >= ($1);
            `, [data.get('delivery_order')]
        );
        //  Delete customer in request
        await client.query(`
            DELETE
            FROM customer_table
            WHERE id = $1
            `, [data.get('customer_id')]
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
}
