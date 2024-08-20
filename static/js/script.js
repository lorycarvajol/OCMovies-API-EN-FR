// Exécute le script une fois que le DOM est entièrement chargé
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";  // Base URL de l'API

    // Fonction pour récupérer les films par catégorie
    const fetchMovies = async (category, callback) => {
        let url = `${API_URL}titles/?sort_by=-imdb_score&page_size=40`;  // URL pour récupérer les films
        if (category) {
            url += `&genre=${category}`;  // Ajoute le paramètre de genre si une catégorie est spécifiée
        }
        const response = await fetch(url);  // Requête à l'API
        const data = await response.json();  // Conversion de la réponse en JSON
        callback(data.results);  // Appelle la fonction callback avec les résultats des films
    };

    // Fonction pour récupérer le film avec le meilleur score IMDb
    const fetchBestMovie = async () => {
        const response = await fetch(`${API_URL}titles/?sort_by=-imdb_score&page_size=1`);  // Récupère le film avec le meilleur score
        const data = await response.json();  // Conversion de la réponse en JSON
        return data.results[0];  // Retourne le premier film (le meilleur)
    };

    // Fonction pour récupérer les détails d'un film
    const fetchMovieDetails = async (id) => {
        const response = await fetch(`${API_URL}titles/${id}`);  // Récupère les détails du film par ID
        return await response.json();  // Conversion de la réponse en JSON et retour des détails du film
    };

    // Fonction pour créer un élément de film (div avec image et titre)
    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");  // Crée un élément div
        movieElement.classList.add("movie");  // Ajoute la classe "movie" à l'élément

        // URL de l'image par défaut en cas d'erreur
        const defaultImageUrl = "URL_DE_VOTRE_IMAGE_PAR_DEFAUT";  // Remplacez par l'URL de l'image par défaut

        movieElement.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title}" onerror="this.src='${defaultImageUrl}'" />  // Image du film avec gestion d'erreur
            <p class="movie-title">${movie.title}</p>`;  // Titre du film
        movieElement.addEventListener("click", () => showModal(movie.id));  // Ajoute un événement au clic pour afficher les détails du film
        return movieElement;  // Retourne l'élément de film
    };

    // Fonction pour afficher les détails du film dans une modale
    const showModal = async (id) => {
        const movie = await fetchMovieDetails(id);  // Récupère les détails du film par ID
        const modal = document.getElementById("modal");  // Sélectionne la modale
        const modalDetails = document.getElementById("modal-details");  // Sélectionne l'élément de détails de la modale

        modalDetails.innerHTML = `
            <div class="modal-header">
                <h2>${movie.title}</h2>
            </div>
            <div class="modal-body">
                <div class="left-column">
                    <img src="${movie.image_url}" alt="${movie.title}" onerror="this.src='${defaultImageUrl}'" />  // Image du film avec gestion d'erreur
                    <p>${movie.description}</p>  // Description du film
                </div>
                <div class="right-column">
                    <ul>
                        <li><strong>Genre: </strong> ${movie.genres.join(", ")}</li>
                        <li><strong>Date de sortie: </strong> ${movie.date_published}</li>
                        <li><strong>Rated: </strong> ${movie.rated}</li>
                        <li><strong>Score Imdb: </strong> ${movie.imdb_score}</li>
                        <li><strong>Réalisateur: </strong> ${movie.directors.join(", ")}</li>
                        <li><strong>Acteurs: </strong> ${movie.actors.join(", ")}</li>
                        <li><strong>Durée: </strong> ${movie.duration} minutes</li>
                        <li><strong>Pays d'origine: </strong> ${movie.countries.join(", ")}</li>
                        <li><strong>Box Office: </strong> ${movie.worldwide_gross_income || 'N/A'}</li>
                    </ul>
                </div>
            </div>
        `;
        modal.style.display = "block";  // Affiche la modale
    };

    // Fonction pour fermer la modale
    const closeModal = () => {
        const modal = document.getElementById("modal");  // Sélectionne la modale
        modal.style.display = "none";  // Masque la modale
    };

    document.querySelector(".close").addEventListener("click", closeModal);  // Ajoute un événement au clic pour fermer la modale
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("modal");
        if (event.target === modal) {
            closeModal();  // Ferme la modale si l'utilisateur clique en dehors
        }
    });

    // Fonction pour gérer le défilement des films
    const slideMovies = (containerId, direction) => {
        const container = document.getElementById(containerId);  // Sélectionne le conteneur de films
        const movies = container.querySelectorAll(".movie");  // Sélectionne tous les éléments de film
        const firstVisibleIndex = parseInt(container.getAttribute("data-first-index"), 10);  // Récupère l'index du premier film visible
        const totalMovies = movies.length;  // Nombre total de films
        let newFirstVisibleIndex;

        if (direction === "right") {
            newFirstVisibleIndex = (firstVisibleIndex + 7) % totalMovies;  // Avance de 7 films
        } else {
            newFirstVisibleIndex = (firstVisibleIndex - 7 + totalMovies) % totalMovies;  // Recule de 7 films
        }

        container.setAttribute("data-first-index", newFirstVisibleIndex);  // Met à jour l'index du premier film visible
        movies.forEach((movie, index) => {
            movie.style.display = (index >= newFirstVisibleIndex && index < newFirstVisibleIndex + 7) ? "block" : "none";  // Affiche les 7 films suivants
        });
    };

    // Fonction pour configurer les boutons de défilement
    const setupScrollButtons = () => {
        document.getElementById("scroll-left-top-rated").addEventListener("click", () => slideMovies("top-rated-movies", "left"));
        document.getElementById("scroll-right-top-rated").addEventListener("click", () => slideMovies("top-rated-movies", "right"));
        document.getElementById("scroll-left-category1").addEventListener("click", () => slideMovies("category1-movies", "left"));
        document.getElementById("scroll-right-category1").addEventListener("click", () => slideMovies("category1-movies", "right"));
        document.getElementById("scroll-left-category2").addEventListener("click", () => slideMovies("category2-movies", "left"));
        document.getElementById("scroll-right-category2").addEventListener("click", () => slideMovies("category2-movies", "right"));
        document.getElementById("scroll-left-category3").addEventListener("click", () => slideMovies("category3-movies", "left"));
        document.getElementById("scroll-right-category3").addEventListener("click", () => slideMovies("category3-movies", "right"));
    };

    // Fonction pour exclure un film spécifique de la liste des résultats
    const excludeMovie = (movies, title) => {
        return movies.filter(movie => movie.title !== title);  // Filtre les films pour exclure ceux avec un titre spécifique
    };

    // Fonction pour charger les films et mettre à jour la section du film vedette
    const loadMovies = async () => {
        // Récupère le meilleur film et met à jour la section du film vedette
        const bestMovie = await fetchBestMovie();  // Récupère le meilleur film
        const bestMovieDetails = await fetchMovieDetails(bestMovie.id);  // Récupère les détails du meilleur film
        const bestMovieSection = document.getElementById("best-movie-image");  // Sélectionne la section du meilleur film
        bestMovieSection.style.backgroundImage = `url(${bestMovieDetails.image_url})`;  // Met à jour l'image de fond

        document.getElementById("best-movie-title").innerText = bestMovieDetails.title;  // Met à jour le titre du meilleur film
        document.getElementById("best-movie-summary").innerText = bestMovieDetails.description;  // Met à jour la description du meilleur film
        document.getElementById("more-info-button").addEventListener("click", () => showModal(bestMovieDetails.id));  // Ajoute un événement pour afficher plus d'infos

        // Affiche les films les mieux notés toutes catégories confondues
        fetchMovies(null, (movies) => {
            const section = document.getElementById("top-rated-movies");  // Sélectionne la section des films les mieux notés
            section.setAttribute("data-first-index", "0");  // Définit l'index du premier film visible à 0
            movies.forEach(movie => section.appendChild(createMovieElement(movie)));  // Ajoute les films à la section
            slideMovies("top-rated-movies", "right");  // Fait défiler les films
        });

        // Catégories de films à afficher
        const categories = ["Adventure", "Animation", "Biography"];  // Liste des catégories à afficher
        const sections = ["category1-movies", "category2-movies", "category3-movies"];  // Sections correspondantes

        // Récupère et affiche les films pour chaque catégorie
        categories.forEach((category, index) => {
            fetchMovies(category, (movies) => {
                const section = document.getElementById(sections[index]);  // Sélectionne la section correspondant à la catégorie
                section.setAttribute("data-first-index", "0");  // Définit l'index du premier film visible à 0
                movies.forEach(movie => section.appendChild(createMovieElement(movie)));  // Ajoute les films à la section
                slideMovies(sections[index], "right");  // Fait défiler les films
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
            scrollDownIndicator.style.display = "none";  // Masque l'indicateur lorsque l'utilisateur défile
        } else {
            scrollDownIndicator.style.display = "block";  // Affiche l'indicateur lorsque l'utilisateur est en haut de la page
        }
    });

    // Fait défiler la page vers le bas lorsqu'on clique sur l'indicateur de défilement
    scrollDownIndicator.addEventListener("click", () => {
        window.scrollBy({
            top: window.innerHeight,  // Fait défiler vers le bas d'une hauteur d'écran
            behavior: 'smooth'  // Défilement en douceur
        });
    });

    // Charge les films au démarrage
    loadMovies();
});
