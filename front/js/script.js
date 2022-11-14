const itemHtmlCards = document.getElementById('items');

itemHtmlCards.innerHTML = "<article>Tototo</article>";

//Retrieve item list from the API
fetch("http://localhost:3000/api/products")
	.then((res) => {
		console.log(res.json());
		return res.json();
	})
	.then((value) => {
		console.log(value);
	})
	.catch((err) => {
		console.log(err);
	});