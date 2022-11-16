//Main function to load when the html loads
const main = async () => {
	const item = await getItemFromUrl();
	fillItemProperties(item);

	//Définition de la structure du JSON à définir dans le localStorage pour le stockage du panier
	//Création d'un exemple
	const cartitem1 = {
		id: 'a6ec5b49bd164d7fbe10f37b6363f9fb',
		quantity: 26,
		color: 'Pink'
	};
	const cartitem2 = {
		id: 'a6ec5b49bd164d7fbe10f37b6363f9fb',
		quantity: 22,
		color: 'Brown'
	};
	const myarray = [cartitem1, cartitem2];
	localStorage.setItem('cartItems', JSON.stringify(myarray));
	const cartItems = localStorage.getItem('cartItems');
	console.log(cartItems);
}

//Retrieve specific item from the API given its id, found in the URL in the parameter "id"
const getItemFromUrl = async () => {
	const url = new URL(window.location.href);
	const productId = url.searchParams.get("id");
	const item = fetch(`http://localhost:3000/api/products/${productId}`)
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
		})
		.catch((err) => {
			console.log(err);
		});
	return item;
}

//Fill the properties of the item given in the DOM
const fillItemProperties = (item) => {
	//The element containing the image is the only one of the class "item__img"
	document.getElementsByClassName('item__img')[0].insertAdjacentHTML('beforeend', `<img src="${item.imageUrl}" alt="${item.altTxt}">`);

	document.getElementById('title').insertAdjacentHTML('beforeend', item.name);
	document.getElementById('price').insertAdjacentHTML('beforeend', item.price);
	document.getElementById('description').insertAdjacentHTML('beforeend', item.description);

	//Looping on all items colors to add on each one its corresponding option in html
	let itemColorsOptions = '';
	for (let i = 0; i < item.colors.length; i++) {
		itemColorsOptions += `<option value="${item.colors[i]}">${item.colors[i]}</option>`;
	}
	document.getElementById('colors').insertAdjacentHTML('beforeend', itemColorsOptions);
}

// -----------------------------------------------------------------
// --- Waiting for the DOM loading to start the main function
// -----------------------------------------------------------------
window.addEventListener('load', main)