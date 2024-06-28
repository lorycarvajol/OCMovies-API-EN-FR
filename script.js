document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";

    const fetchMovies = async (category, callback) => {
        const response = await fetch(`${API_URL}titles/?genre=${category}&sort_by=-imdb_score`);
        const data = await response.json();
        callback(data.results);
    };

    const fetchBestMovie = async () => {
        const response = await fetch(`${API_URL}titles/?sort_by=-imdb_score`);
        const data = await response.json();
        return data.results[0];
    };

    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");
        movieElement.innerHTML = `<img src="${movie.image_url}" alt="${movie.title}" />`;
        movieElement.addEventListener("click", () => showModal(movie.id));
        return movieElement;
    };

    const showModal = async (id) => {
        const response = await fetch(`${API_URL}titles/${id}`);
        const movie = await response.json();
        const modal = document.getElementById("modal");
        const modalDetails = document.getElementById("modal-details");

        modalDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title}" />
            <h2>${movie.title}</h2>
            <p>${movie.description}</p>
            <ul>
                <li>Genre: ${movie.genres.join(", ")}</li>
                <li>Date de sortie: ${movie.date_published}</li>
                <li>Rated: ${movie.rated}</li>
                <li>Score Imdb: ${movie.imdb_score}</li>
                <li>Réalisateur: ${movie.directors.join(", ")}</li>
                <li>Acteurs: ${movie.actors.join(", ")}</li>
                <li>Durée: ${movie.duration} minutes</li>
                <li>Pays d'origine: ${movie.countries.join(", ")}</li>
                <li>Box Office: ${movie.worldwide_gross_income}</li>
            </ul>
        `;
        modal.style.display = "block";
    };

    const closeModal = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };

    document.querySelector(".close").addEventListener("click", closeModal);

    const loadMovies = async () => {
        const bestMovie = await fetchBestMovie();
        document.getElementById("best-movie-details").innerHTML = `
            <img src="${bestMovie.image_url}" alt="${bestMovie.title}" />
            <h3>${bestMovie.title}</h3>
            <p>${bestMovie.description}</p>
        `;

        const categories = ["", "Action", "Comedy", "Drama"];
        const sections = ["top-rated-movies", "category1-movies", "category2-movies", "category3-movies"];

        categories.forEach((category, index) => {
            fetchMovies(category, (movies) => {
                const section = document.getElementById(sections[index]);
                movies.forEach(movie => section.appendChild(createMovieElement(movie)));
            });
        });
    };

    loadMovies();
});
