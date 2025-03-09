let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let favoritedDogs = [];

// Fetch all breeds and populate the breed filter
async function fetchBreeds() {
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/breeds', {
            credentials: 'include',
        });
        const breeds = await response.json();
        const breedFilter = document.getElementById('breed-filter');

        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching breeds:', error);
    }
}

// Fetch dogs based on filters and pagination
async function fetchDogs() {
    const { breed, sort } = currentFilters;
    const url = new URL('https://frontend-take-home-service.fetch.com/dogs/search');
    url.searchParams.set('size', 24); // Fetch 24 dogs per page
    url.searchParams.set('from', (currentPage - 1) * 24);

    if (breed) url.searchParams.set('breeds', breed);
    if (sort) url.searchParams.set('sort', sort); // Use the selected sort option

    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        const data = await response.json();
        totalPages = Math.ceil(data.total / 24); // Use 24 to match the size parameter
        renderDogs(data.resultIds);
        updatePagination();
    } catch (error) {
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
        const isFavorited = favoritedDogs.includes(dog.id);
        dogCard.innerHTML = `
            <img src="${dog.img}" alt="${dog.name}">
            <h3>${dog.name}</h3>
            <p>${dog.breed}, ${dog.age} years old</p>
            <button onclick="toggleFavorite('${dog.id}')" 
                    style="${isFavorited ? 'background-color: #4CAF50;' : ''}" 
                    ${isFavorited ? 'disabled' : ''}>
                ${isFavorited ? '❤️ Favorited' : '❤️'}
            </button>
        `;
        dogList.appendChild(dogCard);
    });
}

// Function to handle adding/removing favorites
function toggleFavorite(dogId) {
    const index = favoritedDogs.indexOf(dogId);

    if (index === -1) {
        // If the dog is not in favorites, add it
        favoritedDogs.push(dogId);
    } else {
        // If the dog is already in favorites, remove it
        favoritedDogs.splice(index, 1);
    }

    // Re-render the list to update UI
    if (document.getElementById('back-button').style.display === 'block') {
        // If viewing favorites, re-render the favorites list
        fetchDogsByIds(favoritedDogs);
    } else {
        // Otherwise, re-render the main dog list
        fetchDogs();
    }
}

// Update pagination buttons and page info
function updatePagination() {
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Event listeners for filters and pagination
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

// View Favorites
document.getElementById('view-favorites').addEventListener('click', () => {
    if (favoritedDogs.length > 0) {
        fetchDogsByIds(favoritedDogs);
        document.getElementById('back-button').style.display = 'block'; // Show Back button
    } else {
        alert('You have no favorited dogs yet!');
    }
});

// Fetch dogs by IDs (for favorites)
async function fetchDogsByIds(dogIds) {
    try {
        const response = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dogIds),
            credentials: 'include',
        });
        const dogs = await response.json();
        renderDogs(dogIds); // Pass the fetched dogs
    } catch (error) {
        console.error('Error fetching favorited dogs:', error);
    }
}

// Generate Match
document.getElementById('generate-match').addEventListener('click', async () => {
    if (favoritedDogs.length > 0) {
        try {
            const response = await fetch('https://frontend-take-home-service.fetch.com/dogs/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(favoritedDogs),
                credentials: 'include',
            });
            const match = await response.json();
            displayMatch(match.match);
        } catch (error) {
            console.error('Error generating match:', error);
        }
    } else {
        alert('Please favorite at least one dog to generate a match!');
    }
});

// Display the matched dog
function displayMatch(dogId) {
    fetchDogsByIds([dogId]);
    alert('You’ve been matched with a dog! Click OK to view.');
}

// Logout
document.getElementById('logout-button').addEventListener('click', async () => {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
        try {
            const response = await fetch('https://frontend-take-home-service.fetch.com/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                // Redirect to the login page after successful logout
                window.location.href = 'index.html';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
});

// Back to Search
document.getElementById('back-button').addEventListener('click', () => {
    fetchDogs(); // Reloads the main dog listing
    document.getElementById('back-button').style.display = 'none'; // Hide Back button
});

// Initialize the page with sorting applied
currentFilters.sort = 'breed:asc';
fetchBreeds();
fetchDogs();