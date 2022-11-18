//Main function to load when the html loads
const main = async () => {
	const url = new URL(window.location.href);
	document.getElementById('orderId').insertAdjacentHTML('beforeend', url.searchParams.get("orderId"));
}

// -----------------------------------------------------------------
// --- Waiting for the DOM loading to start the main function
// -----------------------------------------------------------------
window.addEventListener('load', main)