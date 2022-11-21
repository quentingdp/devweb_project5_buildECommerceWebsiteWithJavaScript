//Main function to load when the html loads
const main = async () => {
	//Getting and loading the properties of the item in the page
	const item = await getItemFromUrl();
	fillItemProperties(item);

	//Initialyzing the inputs of current page and activating behaviours
	const currentCartItem = new CartItem(item._id, 0, '')

	//Activating the quantity field behavior : when loses the focus,
	//the quantity is updated in our currentCartItem (except if the value is outside limits)
	const htmlInputQuantity = document.getElementById('quantity');
	htmlInputQuantity.addEventListener('input', (event) => {
		updateCurrentQuantity(htmlInputQuantity, currentCartItem);
	});

	//Activating the color field behavior : when loses the focus,
	//the color is updated in our currentCartItem
	const htmlInputColor = document.getElementById('colors');
	htmlInputColor.addEventListener('input', (event) => {
		updateCurrentColor(htmlInputColor, currentCartItem);
	});

	//Activating the button "Ajouter au panier" click behavior
	const button = document.getElementById('addToCart');
	button.addEventListener('click', (event) => {
		addCurrentCartItemInCart(currentCartItem);
	});
}

//Define the class that represents a Cart Item
class CartItem {
	constructor(id, quantity, color) {
		this.id = id;
		this.quantity = quantity;
		this.color = color;
	}
}

/**
 * Retrieve specific item from the API product given its id, found in the URL in the parameter "id"
 * @returns {Promise<{colors: string[],"_id": string, name: string, price: number, imageUrl: string, description: string, altTxt: string}>}
 */
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

/**
 * Fill in the DOM the properties of the item given as parameter
 * @param {{colors: string[],"_id": string, name: string, price: number, imageUrl: string, description: string, altTxt: string}} item 
 */
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

/**
 * Updates the quantity chosen and deals with errors
 * @param {HTMLElement} htmlInputQuantity 
 * @param {CartItem} currentCartItem 
 */
const updateCurrentQuantity = (htmlInputQuantity, currentCartItem) => {
	const qty = htmlInputQuantity.value;
	if (isNaN(qty) || qty < 1 || qty > 100) {
		htmlInputQuantity.value = 1;
		currentCartItem.quantity = 1;
		alert(`La valeur ${qty} n'est pas autorisée. Elle doit être entre 1 et 100.`);
	} else {
		currentCartItem.quantity = qty * 1;
	}
}

/**
 * Updates the color chosen and deals with errors
 * @param {HTMLElement} htmlInputColor 
 * @param {CartItem} currentCartItem 
 */
const updateCurrentColor = (htmlInputColor, currentCartItem) => {
	currentCartItem.color = htmlInputColor.options[htmlInputColor.selectedIndex].value;
}

/**
 * Loads the stored cart in the local storage, cleans it, adds the current Cart chosen in the page into the cart (if all data is valid) and push the whole cart in the local storage
 * @param {CartItem} currentCartItem 
 */
const addCurrentCartItemInCart = (currentCartItem) => {
	//Initially, we check if the item is valid (i.e. color has been filled and quantity is not 0)
	if (currentCartItem.color === '' || currentCartItem.quantity === 0) {
		alert("Vous devez choisir une couleur et une quantité différente de 0 avant d'ajouter au panier");
	} else {
		const cart = [];
		//boolean used to know if we already added our current item in the cart
		let isAdded = false;
		//Initialyzation of the cart from the Local Storage, if any
		if (localStorage.getItem('cartItems')) {
			try {
				const cartStored = JSON.parse(localStorage.getItem('cartItems'));
				for (let i = 0; i < cartStored.length; i++) {
					//We load the cart items only if they are valid (i.e. all properties are available)
					if (cartStored[i].id && Number.isInteger(cartStored[i].quantity) && cartStored[i].color) {
						//We add our current item in the cart if the primary key matches
						if (cartStored[i].id === currentCartItem.id && cartStored[i].color === currentCartItem.color) {
							cart.push(new CartItem(cartStored[i].id, cartStored[i].quantity + currentCartItem.quantity, cartStored[i].color));
							isAdded = true;
							alert('Ajouté dans le panier');
						} else {
							cart.push(new CartItem(cartStored[i].id, cartStored[i].quantity, cartStored[i].color));
						}
					} else {
						console.warn(`Un article du panier stocké localement n'était pas valide. Il a été retiré du panier : ${JSON.stringify(cartStored[i])}`);
					}
				}
			} catch (e) {
				console.error("Le panier stocké n'est pas valide. Il a été réinitialisé. Code d'erreur :", e);
			}
		};
		//Adding our current item into the Cart, if not already
		if (!isAdded) {
			cart.push(new CartItem(currentCartItem.id, currentCartItem.quantity, currentCartItem.color));
			alert('Ajouté dans le panier');
		}
		//Replaces the cart defined in the Local Storage by the cart stored in the Array "cart"
		localStorage.setItem('cartItems', JSON.stringify(cart));
	}
}

// -----------------------------------------------------------------
// --- Waiting for the DOM loading to start the main function
// -----------------------------------------------------------------
window.addEventListener('load', main)