document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";

    // Fonction pour récupérer les films par catégorie
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

    // Fonction pour récupérer le film avec le meilleur score IMDb et ses détails
    const fetchBestMovie = async () => {
        const response = await fetch(`${API_URL}titles/?sort_by=-imdb_score&page_size=1`);
        const data = await response.json();
        const bestMovieId = data.results[0].id;

        // Récupère les détails du meilleur film
        const bestMovieResponse = await fetch(`${API_URL}titles/${bestMovieId}`);
        const bestMovieDetails = await bestMovieResponse.json();

        return bestMovieDetails;
    };

    // Fonction pour créer un élément de film
    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");
        movieElement.innerHTML = `<img src="${movie.image_url}" alt="${movie.title}" />`;

        // Ajoute un écouteur d'événements pour afficher les détails du film dans une modale
        movieElement.addEventListener("click", () => showModal(movie.id));
        return movieElement;
    };

    // Fonction pour afficher les détails du film dans une modale
    const showModal = async (id) => {
        const response = await fetch(`${API_URL}titles/${id}`);
        const movie = await response.json();
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
        // Affiche la modale
        modal.style.display = "block";
    };

    // Fonction pour fermer la modale
    const closeModal = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };

    // Ajoute un écouteur d'événements pour fermer la modale lorsqu'on clique sur la croix
    document.querySelector(".close").addEventListener("click", closeModal);

    // Fonction pour faire défiler la liste des films horizontalement
    const scrollMoviesList = (containerId, direction) => {
        const container = document.getElementById(containerId);
        const scrollAmount = 184;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // Fonction pour configurer les boutons de défilement
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

    // Fonction pour exclure un film spécifique de la liste des résultats
    const excludeMovie = (movies, title) => {
        return movies.filter(movie => movie.title !== title);
    };

    // Fonction pour charger les films et mettre à jour la section du film vedette
    const loadMovies = async () => {
        // Récupère le meilleur film et met à jour la section du film vedette
        const bestMovie = await fetchBestMovie();
        const bestMovieSection = document.getElementById("best-movie");
        bestMovieSection.style.backgroundImage = `url(${bestMovie.image_url})`;

        document.getElementById("best-movie-title").innerText = bestMovie.title;
        document.getElementById("best-movie-summary").innerText = bestMovie.description;

        document.getElementById("more-info-button").addEventListener("click", () => showModal(bestMovie.id));

        // Affiche les films les mieux notés toutes catégories confondues
        fetchMovies(null, (movies) => {
            const section = document.getElementById("top-rated-movies");
            movies.forEach(movie => section.appendChild(createMovieElement(movie)));
        });

        // Catégories de films à afficher
        const categories = ["Adventure", "Animation", "Biography"];
        const sections = ["category1-movies", "category2-movies", "category3-movies"];

        // Récupère et affiche les films pour chaque catégorie
        categories.forEach((category, index) => {
            fetchMovies(category, (movies) => {
                const section = document.getElementById(sections[index]);
                movies.forEach(movie => section.appendChild(createMovieElement(movie)));
            });
        });

        // Configure les boutons de défilement
        setupScrollButtons();
    };

    // Gestion de l'indicateur de défilement vers le bas
    const scrollDownIndicator = document.getElementById("scroll-down-indicator");

    // Affiche ou masque l'indicateur de défilement en fonction de la position de défilement
    window.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
            scrollDownIndicator.style.display = "none";
        } else {
            scrollDownIndicator.style.display = "block";
        }
    });

    // Fait défiler la page vers le bas lorsqu'on clique sur l'indicateur de défilement
    scrollDownIndicator.addEventListener("click", () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });

    // Charge les films au démarrage
    loadMovies();
});
