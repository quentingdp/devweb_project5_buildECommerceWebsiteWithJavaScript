//Main function to load when the html loads
const main = async () => {
	//Variable that will contain the cart
	const cart = [];
	const itemList = await getItemList();
	getStoredCartAndDisplay(cart, itemList);

	//Activating the quantity fields behavior : when loses the focus,
	//the quantity is updated in cart (except if the value is outside limits)
	document.querySelectorAll(".itemQuantity").forEach(input => {
		input.addEventListener('blur', (event) => {
			updateCurrentQuantity(event, cart);
		})
	})


	///ERRRORRRRRR !!!! la value de l'input est différent de la valeur affiché quand la valeur sort des bornes. Je ne sais pas pourquoi, à creuser...
}

//Define the class that represents a Cart Item
class CartItem {
	constructor(id, quantity, color) {
		this.id = id;
		this.quantity = quantity;
		this.color = color;
	}
}

//Retrieve item list from the API
const getItemList = async () => {
	const itemList = fetch("http://localhost:3000/api/products")
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
		})
		.catch((err) => {
			console.log(err);
		});
	return itemList;
}

//This function loads the stored cart in the local storage and cleans it. Then, it displays it in the page
//NB: we gathered these 2 behaviours in one function given the performance cost required, to avoid looping 2 different times
const getStoredCartAndDisplay = (cart, itemList) => {
	//Initialyzation of the cart from the Local Storage, if any + preparation of the html to display
	const cartHtmlItems = document.getElementById('cart__items');
	const htmlTotalQuantity = document.getElementById('totalQuantity');
	const htmlTotalPrice = document.getElementById('totalPrice');
	let cartHtmlContent = '';
	let totalQuantity = 0;
	let totalPrice = 0;
	if (localStorage.getItem('cartItems')) {
		//Check if the JSON is correctly formatted
		try {
			const cartStored = JSON.parse(localStorage.getItem('cartItems'));
			//For each id of item in the itemList, then for each color available, we gather all corresponding entries of the cart
			for (let i = 0; i < itemList.length; i++) {
				for (let c = 0; c < itemList[i].colors.length; c++) {
					//Given the primary key id + color from the itemList (i.e. the API), we loop on the stored cart items to create them, aggregating quantities in case of duplicates
					for (let j = 0; j < cartStored.length; j++) {
						if ((Number.isInteger(cartStored[j].quantity)) && (cartStored[j].id === itemList[i]._id) && (cartStored[j].color === itemList[i].colors[c])) {
							if ((cart.length !== 0) && (cart[cart.length - 1].id === cartStored[j].id) && (cart[cart.length - 1].color === cartStored[j].color)) {
								cart[cart.length - 1].quantity += cartStored[j].quantity;
							} else {
								cart.push(new CartItem(cartStored[j].id, cartStored[j].quantity, cartStored[j].color));
							}
						}
					}
					//We get the information from the API (itemList) + from the cart, and prepare it for html only if a cart item exist
					if ((cart.length !== 0) && (cart[cart.length - 1].id === itemList[i]._id) && (cart[cart.length - 1].color === itemList[i].colors[c])) {
						cartHtmlContent += `
							<article class="cart__item" data-id="${cart[cart.length - 1].id}" data-color="${cart[cart.length - 1].color}">
								<div class="cart__item__img">
									<img src="${itemList[i].imageUrl}" alt="${itemList[i].altTxt}">
								</div>
								<div class="cart__item__content">
									<div class="cart__item__content__description">
										<h2>${itemList[i].name}</h2>
										<p>${cart[cart.length - 1].color}</p>
										<p>${itemList[i].price},00 €</p>
									</div>
									<div class="cart__item__content__settings">
										<div class="cart__item__content__settings__quantity">
											<p>Qté : </p>
											<input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${cart[cart.length - 1].quantity}">
										</div>
										<div class="cart__item__content__settings__delete">
											<p class="deleteItem">Supprimer</p>
										</div>
									</div>
								</div>
							</article>
						`;
						totalPrice += itemList[i].price * cart[cart.length - 1].quantity;
						totalQuantity += cart[cart.length - 1].quantity;
					}
				}
			}
		} catch (e) {
			console.error("Le panier stocké n'est pas valide. Il a été réinitialisé. Code d'erreur :", e);
		}
	};
	//Replaces the cart defined in the Local Storage by the cart stored in the Array "cart"
	localStorage.setItem('cartItems', JSON.stringify(cart));
	//Displays the HTML
	cartHtmlItems.insertAdjacentHTML('beforeend', cartHtmlContent);
	htmlTotalQuantity.insertAdjacentHTML('beforeend', totalQuantity);
	htmlTotalPrice.insertAdjacentHTML('beforeend', totalPrice + ',00');
}

//Retrieve specific item from the API given its id
const getItemFromId = async (id) => {
	const item = fetch(`http://localhost:3000/api/products/${id}`)
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

//This functions triggers when a quantity is updated : it identifies which item has been changed, then update the cart + the total quantities and prices
const updateCurrentQuantity = async (event, cart) => {
	//Gather all item related data from HTML
	let itemQuantity = event.currentTarget.value;
	const self = event.currentTarget.closest("input");
	const id = event.currentTarget.closest("article").getAttribute("data-id");
	const color = event.currentTarget.closest("article").getAttribute("data-color");
	//Prepare the elements + variables for calculating the total quantity and price
	const htmlTotalQuantity = document.getElementById('totalQuantity');
	const htmlTotalPrice = document.getElementById('totalPrice');
	let itemProperties;
	let price;
	let totalQuantity = 0;
	let totalPrice = 0;
	//Errors management on quantity written
	if (isNaN(itemQuantity) || itemQuantity < 1 || itemQuantity > 100) {
		alert(`La valeur ${itemQuantity} n'est pas autorisée. Elle doit être entre 1 et 100.`);
		itemQuantity = 1;
		self.setAttribute("value", itemQuantity);
	} else {
		//Cast to integer
		itemQuantity *= 1;
	}
	for (i = 0; i < cart.length; i++) {
		if ((cart[i].id === id) && (cart[i].color === color)) {
			cart[i].quantity = itemQuantity;
		}
		itemProperties = await getItemFromId(cart[i].id);
		price = itemProperties.price;
		totalQuantity += cart[i].quantity;
		totalPrice += price * cart[i].quantity;
	};
	htmlTotalQuantity.innerHTML = totalQuantity;
	htmlTotalPrice.innerHTML = totalPrice + ',00';
	//Replaces the cart defined in the Local Storage by the cart stored in the Array "cart"
	localStorage.setItem('cartItems', JSON.stringify(cart));
}

// -----------------------------------------------------------------
// --- Waiting for the DOM loading to start the main function
// -----------------------------------------------------------------
window.addEventListener('load', main)