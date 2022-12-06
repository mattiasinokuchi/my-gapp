<!--	This is the delivery page	-->
<script context="module">
	export async function load({ fetch }) {
		let res = null;
		try {
			res = await fetch("/deliver.json");
			const delivery = await res.json();
			return {
				props: {
					delivery,
				},
			};
		} catch (error) {
			return error;
		}
	}
</script>

<script>
	export let delivery;
</script>

<main>
	<h2 hidden={delivery.length > 0}>No deliveries. Add some orders to your customers!</h2>

	<!-- This is a list of delivery dates with products and counts-->
	{#each delivery as { delivery_date, deliveries }}
	<div class="wrapper">
		<div class="box">
			<a sveltekit:prefetch href={`/deliver/${delivery_date}`}>
				<h2>
					{delivery_date}
				</h2>
				{#each deliveries as { quantity, product_name, count }}
					<ul>
						<li>{quantity*count} x {product_name}</li>
					</ul>
				{/each}
			</a>
		</div>
	</div>
	{/each}
</main>

<style>
	.box {
		display: flex;
		justify-content: center;
	}
</style>
