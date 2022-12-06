<!--	This is the delivery page	-->
<script context="module">
	export async function load({ fetch, params }) {
		try {
			let res = await fetch(`/deliver/${params.delivery_date}.json`);
			const delivery = await res.json();
			res = await fetch(`/deliver/get_todays_deliveries.json`);
			const todays_delivery = await res.json();
			res = await fetch(
				`/deliver/get_counts/${params.delivery_date}.json`
			);
			const count = await res.json();
			res = await fetch(
				`/deliver/get_phone_numbers/${params.delivery_date}.json`
			);
			const phone = await res.json();
			return {
				props: {
					delivery,
					delivery_date: params.delivery_date,
					todays_delivery,
					currency: process.env.CURRENCY,
					count,
					phone,
				},
			};
		} catch (error) {
			return error;
		}
	}
</script>

<script>
	export let delivery, delivery_date, todays_delivery, currency, count, phone;
	const today = new Date().toISOString().slice(0, 10);
	let buttonText = "Copy telephone numbers";
	let editEnabled = false;
	function copy() {
		navigator.clipboard.writeText(phone[0].numbers);
		buttonText = "Phone numbers copied";
	}
</script>

<main>
	<!-- This is for screens -->
	<div id="screen">
		<div class="whitebox">
			<h1>{delivery_date}</h1>
			<!-- This is a list of products and counts-->
			{#each count as { product_name, count, quantity }}
				<ul>
					<li>{quantity*count} x {product_name}</li>
				</ul>
			{/each}
			<div class="buttons">
				<!-- This is a button for copying customers phone numbers -->
				<button on:click={copy}>{buttonText}</button>
				<!-- This is a button for printing out a list -->
				<button on:click={() => window.print()}>Print Out</button>
				<!-- This is a undo buttton -->
				<form action="/deliver/undo.json" method="post">
					<input hidden name="delivery_date" value={delivery_date} />
					<input
						type="submit"
						value="Undo last delivery"
						hidden={delivery_date !== today}
						disabled={todays_delivery.length < 1}
					/>
				</form>
			</div>
		</div>

		<h2 hidden={delivery.length > 0}>No more delivery to do. Relax!</h2>

		<!-- This is a list of customers and products to deliver-->
		{#each delivery as { customer_id, first_name, last_name, place_of_delivery, street_address, city, notes, orders }}
		<div class="wrapper">
			<div class="box">
				<h2>
					{first_name}
					{last_name}:
				</h2>
				<p>
					{place_of_delivery},
					{street_address}, {city}
				</p>
				<p hidden={!notes}>Notes: {notes}</p>
				{#each orders as { order_id, product_name, product_id, price, quantity }}
					<p>....................</p>
					<form action="/deliver/deliver.json" method="post">
						<input hidden name="customer_id" value={customer_id} />
						<input hidden name="order_id" value={order_id} />
						<input
							hidden
							name="delivery_date"
							value={delivery_date}
						/>
						<input hidden name="product_id" value={product_id} />
						<p>{quantity} x {product_name}</p>
						<input
							hidden
							type="text"
							name="product_name"
							value={product_name}
						/>
						<input
							hidden
							name="price"
							bind:value={price}
						/>
						<input
							hidden
							name="quantity"
							bind:value={quantity}
						/>
						{#if editEnabled}
						<label for="quantity">Quantity</label>
						<input
							type="number"
							name="quantity"
							bind:value={quantity}
							min="0"
							max="999"
						/>
						<label for="price">Price ({currency})</label>
							<input
								type="number"
								name="price"
								bind:value={price}
								min="0"
								max="999"
							/>
							<label for="delivery_comment">Comment</label>
							<input
								type="text"
								name="delivery_comment"
								size="20"
								placeholder="...discount, damage, loss..."
							/>
							<br />
						{/if}
						<input
							type="button"
							on:click={() => (editEnabled = true)}
							value="Edit"
							hidden={editEnabled}
						/>
						<input
							type="submit"
							value="Deliver"
						/>
					</form>
				{/each}
			</div>
		</div>
		{/each}
	</div>
	<!-- This is for printers -->
	<div id="print">
		<!-- This is a list of products and counts-->
		<p>To deliver:</p>
		{#each count as { product_name, count, quantity }}
			<ul>
				<li>{quantity*count} x {product_name}</li>
			</ul>
		{/each}
		<hr />
		<!-- This is a list of customers and products to deliver-->
		{#each delivery as { first_name, last_name, place_of_delivery, street_address, city, notes, orders }}
			<div id="customer">
				<p>
					{first_name}
					{last_name},
					<span>
						Drop at: {place_of_delivery},
					</span>
					<span>
						{street_address}, {city}
					</span>
					<span hidden={!notes}>Note: {notes}</span>
				</p>
				<ul>
					{#each orders as { product_name, quantity }}
						<li>{quantity} {product_name}</li>
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
	.buttons {
		display: flex;
		align-items: center;
		justify-content: center;
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
