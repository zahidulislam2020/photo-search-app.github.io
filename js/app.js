
let API_KEY = '563492ad6f9170000100000170517b0ea7194e01b5f08a53c33a3fe1';
let home = document.querySelector('.home');
let galleryDiv = document.querySelector('.gallery');
let searchForm = document.querySelector('.header form');
let searchButton = document.querySelector('ion-icon');
let loadMore = document.querySelector('.load-more');
let crossBtn = document.querySelector('.cross');
let currentSearchedWord = '';
let pageIndex = 1;
let scrollY = document.documentElement.style.getPropertyValue('--scroll-y');

document.addEventListener('DOMContentLoaded', () => {
	getImg(1);
});
searchForm.addEventListener('submit', (e) => {
	getSearchedImages(e);
});
searchButton.addEventListener('click', (e) => {
	getSearchedImages(e);
});
loadMore.addEventListener('click', (e) => {
	loadMoreImages(e);
});
home.addEventListener('click', () => {
	galleryDiv.innerHTML = '';
	getImg(1);
});
async function getImg(pageIndex) {
	loadMore.setAttribute('data-img', 'curated');
	const baseURL = `https://api.pexels.com/v1/curated?page=${pageIndex}&per_page=48`;
	const data = await fetchImages(baseURL);
	generateHTML(data.photos);
}
async function fetchImages(baseURL) {
	const response = await fetch(baseURL, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: API_KEY
		}
	})
	const data = await response.json();
		return data;
}
function generateHTML(photos) {
	photos.forEach(photo => {
		const item = document.createElement('div');
		item.classList.add('item');
		item.innerHTML = `
		<a href="#">
			<img src="${photo.src.medium}">
			<span class="photo-size">Size: ${photo.width}x${photo.height}</span>
		</a>
		<h3 style="background: ${photo.avg_color}">Photographer: ${photo.photographer}</h3>
		`;
	galleryDiv.appendChild(item);
				
})
	let items = document.querySelectorAll('.item')
	let classNamePostfix = 1;
	items.forEach(function(e) {
		e.addEventListener('click', modalActivating);
		e.classList.add(`block${classNamePostfix++}`);
		let Id;
		e.addEventListener('mouseenter', zoom);
		function zoom(el) {		
			Id = setTimeout(function() {
				el.target.setAttribute('style', 'transform: scale(1.3); z-index: 300');
					el.path[0].childNodes[1].childNodes[3].setAttribute('style', 'display: inline-block');
				}, 1000)
		}
		e.addEventListener('mouseleave', zoomOut);
		function zoomOut(el) {
			el.target.setAttribute('style', 'transform: scale(1); z-index: 1');
			el.path[0].childNodes[1].childNodes[3].setAttribute('style', 'display: none');
			clearTimeout(Id)
		}		
	})

	let body = document.body;
	let overlay = document.querySelector('.overlay');
	let modal = document.querySelector('.modal');
	let header = document.querySelector('.header');
	//let crossBtn = document.querySelector('.cross');
	let isClicked = false;
					
	function modalActivating(el) {
		el.preventDefault();
		if(!isClicked) {
			let scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
			const body = document.body;
			body.style.overflowY = 'hidden';
			body.style.zIndex = '0';
			body.style.top = '0';
			body.style.left = '0';
			body.style.width = '100%';
			body.style.top = `-${scrollY}`;
			document.documentElement.style.setProperty('--scroll-y', `${scrollY}`);		
			overlay.classList.add('overlay-action');
			modal.classList.add('modal-action');
			crossBtn.style.display = 'inline-block';
			header.style.position = 'static';
			document.querySelector('section').style.width = '100%';
			//console.log(parseInt(scrollY) < parseInt('150%'))
			//console.log(scrollY)
			//document.querySelector('.overlay-action').style.width = '100%';
			if(parseInt(scrollY) < parseInt('150%')) {
				document.querySelector('.overlay-action').style.height = '200vh';
				console.log('range within 150%')
			}else {
				document.querySelector('.overlay-action').style.height = `${scrollY}`;
				console.log('range more than 150%')
			}
			document.querySelector('.overlay-action').style.zIndex = '400';
						
			for(let i = 0; i < photos.length; i++) {
				if(el.target.src === photos[i].src.medium) {
					modal.innerHTML = `<img src="${photos[i].src.original}">`;
				}
			}
			isClicked = true;	
		}

	}
				
	function modalDeactivating(e) {
			//e.stopPropagation()	
			const body = document.body;
			let scrollY = body.style.top;
			body.style.position = '';
			body.style.top = '';
			//window.scrollTo(0, parseInt(scrollY || '0') * -1);
			document.querySelector('section').style.width = '100%';
			body.style.overflowY = 'scroll';			
			overlay.classList.remove('overlay-action');
			modal.classList.remove('modal-action');
			header.style.position = 'sticky';
			crossBtn.style.display = 'none';
			modal.innerHTML = '';
			isClicked = false;
	}
	crossBtn.addEventListener('click', modalDeactivating);
}
	
window.addEventListener('scroll', () => {
	document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}%`);
});	

async function getSearchedImages(e) {
	loadMore.setAttribute('data-img', 'search');
	e.preventDefault();
	galleryDiv.innerHTML = '';
	let searchValue = document.querySelector('input').value;
	pageIndex = 1;
	if(searchValue === '') {
		clearTimeout(stopId);
		galleryDiv.innerHTML = '';
		enterSearchKeyword();
	}else {
		clearTimeout(stopId);
		galleryDiv.style.visibility = "visible";
		galleryDiv.innerHTML = '';
		currentSearchedWord = searchValue;
		let baseURL = `https://api.pexels.com/v1/search?query=${searchValue}&page=1&per_page=48`;
		let data = await fetchImages(baseURL);
		generateHTML(data.photos);
		document.querySelector('input').value = '';
		
		if(data.photos.length === 0) {
		clearTimeout(stopId);
		galleryDiv.innerHTML = '';
		emptyKeyword()
	}
	}
}
async function getMoreSearchedImages(searchIndex) {
	let searchValue = currentSearchedWord;
	const baseURL = `https://api.pexels.com/v1/search?query=${searchValue}&page=${searchIndex}&per_page=48`;
	const data = await fetchImages(baseURL);
	generateHTML(data.photos);
}
function loadMoreImages(e) {
	
	let loadMoreData = e.target.getAttribute('data-img');

	if(loadMoreData === 'curated') {
		let index = ++pageIndex;
		getImg(index)
		//console.log(index)
	}else if (loadMoreData === 'search') {
		
		let searchIndex = ++pageIndex;
		getMoreSearchedImages(searchIndex)
		//console.log(searchIndex)
		
	}
}

let isShown = false;
let stopId;

function enterSearchKeyword() {
	galleryDiv.innerHTML = 'Enter search keyword';
	galleryDiv.style.color = 'red';
	galleryDiv.style.fontWeight = '500';
	stopId = setTimeout(function() {
		if(!isShown) {
			galleryDiv.style.visibility = "hidden";
			setTimeout(function(){
				isShown = true;
				enterSearchKeyword()
			})
		}else if(isShown) {
			galleryDiv.style.visibility = "visible";
				setTimeout(function(){
					isShown = false;
					enterSearchKeyword()
				})
		}
	}, 600)
}

function emptyKeyword() {
	galleryDiv.innerHTML = 'Your search keyword not found!!! Try with different keyword';
	galleryDiv.style.color = 'red';
	galleryDiv.style.fontWeight = '500';
	stopId = setTimeout(function() {
		if(!isShown) {
			galleryDiv.style.visibility = "hidden";
			setTimeout(function(){
				isShown = true;
				emptyKeyword()
			})
		}else if(isShown) {
			galleryDiv.style.visibility = "visible";
				setTimeout(function(){
					isShown = false;
					emptyKeyword()
				})
		}
	}, 600)
}

/////////////////////////////////////////////////////////























