/*  This module contains an endpoint that updates
    the delivery order in the database  */

import { pool } from '$lib/db';

/*  Client instance must be used in transaction with PostgreSQL.
    Avoids string concatenating parameters into the
    query text directly to prevent sql injection    */
export const post = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const client = await pool.connect();
    const new_order = request.body.get('delivery_order');
    const customer_id = request.body.get('customer_id');
    let old_order = null;
    try {
        await client.query('BEGIN');
        //  Get current delivery order of customer in request
        const res = await client.query(`
            SELECT delivery_order
            FROM customer_table
            WHERE id = ($1);
            `, [customer_id]
        );
        old_order = res.rows[0].delivery_order;
        if (new_order < old_order) {
            //  Defer other customers
            await client.query(`
                UPDATE customer_table
                SET delivery_order = delivery_order + 1
                WHERE delivery_order BETWEEN ($1) AND ($2);
                `, [new_order, old_order]
            );
            //  Advance customer in request
            await client.query(`
                UPDATE customer_table
                SET delivery_order = ($1)
                WHERE id = ($2);
                `, [new_order, customer_id]
            );
        } else {
            //  Advance other customers
            await client.query(`
                UPDATE customer_table
                SET delivery_order = delivery_order - 1
                WHERE delivery_order BETWEEN ($1) AND ($2);
                `, [old_order, new_order]
            );
            //  Defer customer in request
            await client.query(`
                UPDATE customer_table
                SET delivery_order = ($1)
                WHERE id = ($2);
                `, [new_order, customer_id]
            );
        }
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
