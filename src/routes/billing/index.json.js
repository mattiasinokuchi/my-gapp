/*  This module contains endpoints to the database
    for the billing page   */

import { pool } from '$lib/db';

export const get = async (request) => {
    if (!request.locals.user) {
        return {
            status: 401,
            body: 'Please log in!'
        }
    }
    try {
        // Remove old billings
        await pool.query(`
            DELETE FROM delivery_table
            WHERE billing_date :: DATE < (CURRENT_DATE-90);
        `);
        //  Get deliveries...
        const res = await pool.query(`
            SELECT
                delivery_table.id AS delivery_id,
                TO_CHAR(delivery_time :: DATE, 'yyyy-mm-dd') AS delivery_date,
                TO_CHAR(billing_date :: DATE, 'yyyy-mm-dd') AS bill_date,
                *
            FROM delivery_table
            INNER JOIN customer_table
            ON customer_table.id = delivery_table.customer_id
            ORDER BY customer_table.delivery_order;
        `);
        //  ...then group deliveries by customer
        let to_pay;
        const deliveriesByCustomer = res.rows.reduce((acc, obj) => {
            if (acc.find(
                accObject => accObject.customer_id === obj.customer_id
            )) {
                const index = acc.findIndex(
                    accObject => accObject.customer_id === obj.customer_id
                );
                if (!obj.bill_date) {
                    acc[index].to_pay = acc[index].to_pay + obj.price;
                }
                acc[index].delivery.push({
                    delivery_id: obj.delivery_id,
                    delivery_date: obj.delivery_date,
                    product_name: obj.product_name,
                    price: obj.price,
                    billing_date: obj.bill_date
                });
            } else {
                if (!obj.bill_date) {
                    to_pay = obj.price;
                } else {
                    to_pay = 0
                }
                acc.push({
                    customer_id: obj.customer_id,
                    first_name: obj.first_name,
                    last_name: obj.last_name,
                    to_pay: to_pay,
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

//  Delete deliveries (not in use)
/*export const post = async (event) => {
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
}; */