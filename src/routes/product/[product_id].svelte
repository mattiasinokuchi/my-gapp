<!--    This is a specific product page   -->
<script context="module">
    export async function load({ fetch, params }) {
        const res = await fetch(`/product/${params.product_id}.json`);
        if (res.ok) {
            const product = await res.json();
            return {
                props: {
                    product,
                    currency: process.env.CURRENCY,
                },
            };
        }
        const { message } = await res.json();
        return {
            error: new Error(message),
        };
    }
</script>

<script>
    export let product, currency;
    let showDelete = false;
</script>

<main>
    <!-- This is a form for updating product information -->
    <form action="/product/update_product.json" method="post" class="box">
        <h2>{product.product_name}</h2>
        <input type="hidden" name="product_id" value={product.product_id} />
        <p>
            <label for="product_name">Product Name</label>
            <input
                type="text"
                id="product_name"
                name="product_name"
                value={product.product_name}
            />
        </p>
        <p>
            <label for="price">Price ({currency})</label>
            <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                min="0"
                max="999"
            />
        </p>
        <p>
            <label for="delivery_interval">Delivery Interval</label>
            <input
                type="number"
                min="1"
                max="999"
                id="delivery_interval"
                name="delivery_interval"
                value={product.delivery_interval}
            />
        </p>
        <input type="submit" value="Update" />
    </form>
</main>
<!-- This is a form for deleting products -->
<section class="whitebox">
    <button on:click={() => (showDelete = true)} hidden={showDelete}
        >Delete Product</button
    >
    {#if showDelete}
        <form action="/product/remove_product.json" method="post">
            <label for="button">Delete product with all orders?</label>
            <input hidden name="product_id" value={product.product_id} />
            <input id="button" type="submit" value="I know what I'm doing" />
            <button on:click={() => (showDelete = false)}>Cancel</button>
        </form>
    {/if}
</section>

<style>
    .box {
        display: block;
    }
</style>
