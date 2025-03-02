let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

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