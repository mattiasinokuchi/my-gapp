/*  This module contains endpoints to the
    database for the billing page   */

import { pool } from '$lib/db';

//  Remove a delivery
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
        //  Delete delivery
        const res = await pool.query(`
            DELETE
            FROM delivery_table
            WHERE id = $1
            RETURNING *;
        `, [data.get('delivery_id')]);
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
                location: `/billing/`
            }
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};