document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";

    const fetchMovies = async (category, callback) => {
        let url = `${API_URL}titles/?sort_by=-imdb_score&page_size=40`;
        if (category) {
            url += `&genre=${category}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        const filteredResults = excludeMovie(data.results, "Ramayana: The Legend of Prince Rama");
        callback(filteredResults);
    };

    const fetchBestMovie = async () => {
        const response = await fetch(`${API_URL}titles/?sort_by=-imdb_score&page_size=100`);
        const data = await response.json();
        return data.results[0];
    };

    const fetchMovieDetails = async (id) => {
        const response = await fetch(`${API_URL}titles/${id}`);
        return await response.json();
    };

    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");
        movieElement.innerHTML = `<img src="${movie.image_url}" alt="${movie.title}" />`;

        movieElement.addEventListener("click", () => showModal(movie.id));
        return movieElement;
    };

    const showModal = async (id) => {
        const movie = await fetchMovieDetails(id);
        const modal = document.getElementById("modal");
        const modalDetails = document.getElementById("modal-details");

        modalDetails.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title}" />
            <h2>${movie.title}</h2>
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
            <p>${movie.description}</p>
        `;
        modal.style.display = "block";
    };

    const closeModal = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };

    document.querySelector(".close").addEventListener("click", closeModal);

    const scrollMoviesList = (containerId, direction) => {
        const container = document.getElementById(containerId);
        const scrollAmount = 184;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const setupScrollButtons = () => {
        document.getElementById("scroll-left-top-rated").addEventListener("click", () => scrollMoviesList("top-rated-movies", "left"));
        document.getElementById("scroll-right-top-rated").addEventListener("click", () => scrollMoviesList("top-rated-movies", "right"));
        document.getElementById("scroll-left-category1").addEventListener("click", () => scrollMoviesList("category1-movies", "left"));
        document.getElementById("scroll-right-category1").addEventListener("click", () => scrollMoviesList("category1-movies", "right"));
        document.getElementById("scroll-left-category2").addEventListener("click", () => scrollMoviesList("category2-movies", "left"));
        document.getElementById("scroll-right-category2").addEventListener("click", () => scrollMoviesList("category2-movies", "right"));
        document.getElementById("scroll-left-category3").addEventListener("click", () => scrollMoviesList("category3-movies", "left"));
        document.getElementById("scroll-right-category3").addEventListener("click", () => scrollMoviesList("category3-movies", "right"));
    };

    const excludeMovie = (movies, title) => {
        return movies.filter(movie => movie.title !== title);
    };

    const loadMovies = async () => {
        const bestMovie = await fetchBestMovie();
        const bestMovieDetails = await fetchMovieDetails(bestMovie.id);
        const bestMovieSection = document.getElementById("best-movie-image");
        bestMovieSection.style.backgroundImage = `url(${bestMovieDetails.image_url})`;

        document.getElementById("best-movie-title").innerText = bestMovieDetails.title;
        document.getElementById("best-movie-summary").innerText = bestMovieDetails.description;
        document.getElementById("more-info-button").addEventListener("click", () => showModal(bestMovieDetails.id));

        fetchMovies(null, (movies) => {
            const section = document.getElementById("top-rated-movies");
            movies.forEach(movie => section.appendChild(createMovieElement(movie)));
        });

        const categories = ["Adventure", "Animation", "Biography"];
        const sections = ["category1-movies", "category2-movies", "category3-movies"];

        categories.forEach((category, index) => {
            fetchMovies(category, (movies) => {
                const section = document.getElementById(sections[index]);
                movies.forEach(movie => section.appendChild(createMovieElement(movie)));
            });
        });

        setupScrollButtons();
    };

    const scrollDownIndicator = document.getElementById("scroll-down-indicator");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
            scrollDownIndicator.style.display = "none";
        } else {
            scrollDownIndicator.style.display = "block";
        }
    });

    scrollDownIndicator.addEventListener("click", () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });

    loadMovies();
});
