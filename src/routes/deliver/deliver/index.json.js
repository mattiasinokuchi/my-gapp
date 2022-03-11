/*  This module contains endpoints to the database
    for delivery child pages   */

import { pool } from '$lib/db';

/*  Register a delivery.
    Client instance must be used in transaction using node-postgres */
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    const client = await pool.connect();
    const values = [
        data.get('customer_id'),
        data.get('price'),
        data.get('product_name'),
        data.get('product_id'),
        data.get('order_id'),
        data.get('delivery_comment')
    ];
    try {
        await client.query('BEGIN');
        //  Register delivery
        await pool.query(`
            INSERT INTO delivery_table(
                customer_id,
                price,
                product_name,
                product_id,
                order_id,
                delivery_comment
            )
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, values
        );
        //  Check if the delivery is a subscription
        const res = await client.query(`
            SELECT delivery_interval
            FROM order_table
            INNER JOIN product_table ON product_table.id = order_table.product_id
            WHERE order_table.id = ($1);
            `, [data.get('order_id')]
        );
        if (!res.rows[0].delivery_interval) {
            //  Delete the one-time order
            await client.query(`
            DELETE
            FROM order_table
            WHERE id = $1
            `, [data.get('order_id')]
            );
        }
        await client.query('COMMIT');
        return {
            status: 303,
            headers: {
                location: `/deliver/${data.get('delivery_date')}`
            }
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
