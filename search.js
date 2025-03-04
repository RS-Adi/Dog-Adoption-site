let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let favDog = [];

//Fetch all the breeds and then populate the breed filter

async function fetchBreeds() {
    try{
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/breeds', 
        {
            credentials: 'include',
        });
        const breed = await response.json();
        const breedFilter = document.getElementById('breed-filter');

        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedFilter.appendChild(option);
        });
    } catch (error){
        console.error('Error fetching breeds:', error);
    }
}

//Fetching dogs based on the applied filter and pagination used.
async function fetchDogs() {
    const { breed, sort } = currentFilters;
    const url = new URL('https://frontend-take-home-service.fetch.com/dogs/search');

    url.searchParams.set('size', 25);
    url.searchParams.set('from', (currentPage - 1) * 25);
    if (breed) url.searchParams.set('breeds', breed);
    if (sort) url.searchParams.set('sort', sort);

    try{
        const response =  await fetch(url, {
            credentials: 'include',
        });
        const data = await response.json();
        totalPages = Math.ceil(data.total / 25);
        renderDogs(data.resultIds);
        updatePagination();
    }catch (error) {
        console.error('Error fetching dogs:', error);
    }
}

// Render dog cards
async function renderDogs(dogIds) {
    const dogList = document.getElementById('dog-list');
    dogList.innerHTML = ''; // Clear previous results

    if (dogIds.length === 0) {
        dogList.innerHTML = '<p>No dogs found.</p>';
        return;
    }
    const dogsResponse = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include',
    });
    const dogs = await dogsResponse.json();

    dogs.forEach(dog => {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';
        dogCard.innerHTML = `
            <img src="${dog.img}" alt="${dog.name}">
            <h3>${dog.name}</h3>
            <p>${dog.breed}, ${dog.age} years old</p>
            <button onclick="addToFavorites('${dog.id}')">❤️ Favorite</button>
        `;
        dogList.appendChild(dogCard);
    });
}

function addToFavorites(dogId) {
    if (!favDog.includes(dogId)) {
        favDog.push(dogId);
        const button = document.querySelector(`button[onclick="addToFavorites('${dogId}')"]`);
        if (button) {
            button.textContent = '❤️ Favorite';
            button.style.backgroundColor = '#4CAF50';
            button.disabled = true;
        }
    }
}


//When rendered, we have to check for fav's dogs exist or not
function renderDogs(dogIds) {
    const dogList = document.getElementById('dog-list');
    dogList.innerHTML = ''; // Clear previous results

    if (dogIds.length === 0) {
        dogList.innerHTML = '<p>No dogs found.</p>';
        return;
    }

    fetch('https://frontend-take-home-service.fetch.com/dogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dogIds),
        credentials: 'include',
    })
    .then(response => response.json())
    .then(dogs => {
        dogs.forEach(dog => {
            const dogCard = document.createElement('div');
            dogCard.className = 'dog-card';
            const isFavorited = favDog.includes(dog.id);
            dogCard.innerHTML = `
                <img src="${dog.img}" alt="${dog.name}">
                <h3>${dog.name}</h3>
                <p>${dog.breed}, ${dog.age} years old</p>
                <button onclick="addToFavorites('${dog.id}')" 
                        style="${isFavorited ? 'background-color: #4CAF50;' : ''}" 
                        ${isFavorited ? 'disabled' : ''}>
                    ${isFavorited ? '❤️ Favorite' : '❤️ Favorite'}
                </button>
            `;
            dogList.appendChild(dogCard);
        });
    })
    .catch(error => console.error('Error fetching dogs:', error));
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

async function fetchDogs() {
    showLoading(); // Show loading spinner
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/search', {
            credentials: 'include',
        });
        const data = await response.json();
        renderDogs(data.resultIds);
    } catch (error) {
        console.error('Error fetching dogs:', error);
    } finally {
        hideLoading(); // Hide loading spinner
    }
}

    // Updating the pagination buttons and page info
function updatePagination() {
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Adding 'e' listeners for filters and pagination
document.getElementById('breed-filter').addEventListener('change', (e) => {
    currentFilters.breed = e.target.value || undefined;
    currentPage = 1;
    fetchDogs();
});

document.getElementById('sort').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value || undefined;
    currentPage = 1;
    fetchDogs();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchDogs();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchDogs();
    }
});

fetchBreeds();
fetchDogs();