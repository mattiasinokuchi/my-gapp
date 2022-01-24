/*  This module contains an endpoint to the database
    for the undo function at the delivery page   */

import { pool } from '$lib/db';

/*  Undo latest delivery.
    Client instance must be used in transaction with PostgreSQL.
    Avoids string concatenating parameters into the
    query text directly to prevent sql injection    */

export const del = async (request) => {
    /*if (!request.locals.user) {
        return { status: 401 };
    }*/
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        //  Delete delivery
        const res = await pool.query(`
            DELETE
            FROM delivery_table
            WHERE
                (CURRENT_DATE = delivery_time::date) AND
                -- last row in table
                id IN (
                    SELECT id
                    FROM delivery_table
                    ORDER BY id desc
                    LIMIT 1)
            RETURNING *;
        `);
        //  Restore order if deleted
        if (res.rows.length > 0) {
            await pool.query(`
            INSERT INTO order_table(
                id,
                customer_id,
                product_id,
                start_date)
            VALUES($1, $2, $3, CURRENT_DATE)
            ON CONFLICT (id) DO NOTHING;
            `,
                [
                    res.rows[0].order_id,
                    res.rows[0].customer_id,
                    res.rows[0].product_id
                ]
            );
        }
        await client.query('COMMIT');
        return {
            status: 303,
            headers: {
                location: request.headers.referer
            }
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};