<!--	This is the delivery page	-->
<script context="module">
	export async function load({ fetch, params }) {
		try {
			let res = await fetch(`/deliver/${params.delivery_date}.json`);
			const delivery = await res.json();
			res = await fetch(`/deliver/get_todays_deliveries.json`);
			const todays_delivery = await res.json();
			return {
				props: {
					delivery,
					delivery_date: params.delivery_date,
					todays_delivery,
					currency: process.env.CURRENCY,
				},
			};
		} catch (error) {
			return error;
		}
	}
</script>

<script>
	export let delivery, delivery_date, todays_delivery, currency;
	const today = new Date().toISOString().slice(0, 10);
</script>

<main>
	<!-- This is for screens -->
	<div id="screen">
		<div class="whitebox">
			<h1>{delivery_date}</h1>
			<button on:click={() => window.print()}>Print Out</button>
			<!-- This is a undo buttton -->
			<form action="/deliver/undo.json" method="post">
				<input
					hidden
					name="delivery_date"
					value={delivery_date}
				/>
				<input
					type="submit"
					value="Undo last delivery"
					hidden={delivery_date !== today}
					disabled={todays_delivery.length < 1}
				/>
			</form>
		</div>

		<h2 hidden={delivery.length > 0}>No more delivery to do. Relax!</h2>

		<!-- This is a list of customers and products to deliver-->
		{#each delivery as { customer_id, first_name, last_name, place_of_delivery, street_address, city, notes, orders }}
			<div class="box">
				<h2>
					{first_name}
					{last_name}:
				</h2>
				<p hidden={!place_of_delivery}>Place of delivery: {place_of_delivery}</p>
				<p hidden={place_of_delivery}>{street_address}, {city}</p>
				<p hidden={!notes}>Notes: {notes}</p>
				{#each orders as { order_id, product_name, product_id, price }}
					<form action="/deliver/deliver.json" method="post">
						<input hidden name="customer_id" value={customer_id} />
						<input hidden name="order_id" value={order_id} />
						<input hidden name="delivery_date" value={delivery_date} />
						<input hidden name="product_id" value={product_id} />
						<label for="product_name">{product_name}, </label>
						<input
							hidden
							type="text"
							name="product_name"
							value={product_name}
						/>
						<label for="price">({currency})</label>
						<input type="number" name="price" bind:value={price} min="0" max="999"/>
						<br>
						<input
							type="submit"
							value="Deliver"
							disabled={delivery_date !== today}
						/>
					</form>
				{/each}
			</div>
		{/each}
	</div>
	<!-- This is for printers -->
	<div id="print">
		<!-- This is a list of customers and products to deliver-->
		{#each delivery as { first_name, last_name, place_of_delivery, street_address, city, notes, orders }}
			<div id="customer">
				<p>
					{first_name} {last_name},
					<span hidden={!place_of_delivery}>Place of delivery: {place_of_delivery}</span>
					<span hidden={place_of_delivery}>{street_address}, {city}</span> 
					<span hidden={!notes}>Note: {notes}</span> 
				</p>
				<ul>
					{#each orders as { product_name }}
						<li>{product_name}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</main>

<style>
	#print {
		display: none;
	}
	#screen {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	input[type="number"] {
		margin-left: 0;
	}
	/* Hides the navbar for printers*/
	@media print {
		#print {
			display: block;
			text-align: left;
			width: 100%;
			padding-left: 20vw;
			padding-bottom: 20vh;
			position: absolute;
			top: 0;
			background-color: white;
		}
		ul {
			list-style-type: circle;
			padding-left: 5vw;
		}
		#screen {
			display: none;
		}
		#customer {
			break-inside: avoid;
		}
	}
</style>
