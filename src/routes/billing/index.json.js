/*  This module contains endpoints to the database
    for the billing page   */

import { pool } from '$lib/db';

//  Read deliveries...
export const get = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        const res = await pool.query(`
            SELECT
                delivery_table.id AS delivery_id,
                TO_CHAR(delivery_time :: DATE, 'yyyy-mm-dd') AS delivery_date,
                TO_CHAR(billing_date :: DATE, 'yyyy-mm-dd') AS bill_date,
                *
            FROM delivery_table
            INNER JOIN customer_table
            ON customer_table.id = delivery_table.customer_id;
        `);
        //  ...then group deliveries by customer
        const deliveriesByCustomer = res.rows.reduce((acc, obj) => {
            if (acc.find(
                accObject => accObject.customer_id === obj.customer_id
            )) {
                const index = acc.findIndex(
                    accObject => accObject.customer_id === obj.customer_id
                );
                acc[index].delivery.push({
                    delivery_id: obj.delivery_id,
                    delivery_date: obj.delivery_date,
                    product_name: obj.product_name,
                    price: obj.price,
                    billing_date: obj.bill_date
                });
            } else {
                acc.push({
                    customer_id: obj.customer_id,
                    first_name: obj.first_name,
                    last_name: obj.last_name,
                    delivery: [{
                        delivery_id: obj.delivery_id,
                        delivery_date: obj.delivery_date,
                        product_name: obj.product_name,
                        price: obj.price,
                        billing_date: obj.bill_date
                    }]
                });
            }
            return acc;
        }, []);
        return {
            body: deliveriesByCustomer
        }
    } catch (error) {
        console.log(error);
    }
}

//  Delete deliveries
export const post = async (event) => {
    if (!event.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    const data = await event.request.formData();
    try {
        await pool.query(`
        DELETE FROM delivery_table
            WHERE customer_id = $1
            AND delivery_time :: DATE < CURRENT_DATE;  -- prevents interference with ongoing delivery
            `, [data.get('customer_id')]
        );
        return {
            status: 303,
            headers: {
                location: '/billing'
            }
        };
    } catch (error) {
        console.log(error)
    }
};