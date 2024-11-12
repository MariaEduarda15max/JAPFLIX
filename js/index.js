document.addEventListener('DOMContentLoaded', async () => {
    let peliculas = [];
    
    try {
        const respuesta = await fetch('https://japceibal.github.io/japflix_api/movies-data.json');
        if (!respuesta.ok) throw new Error('Error al cargar los datos');
        peliculas = await respuesta.json();
    } catch (error) {
        console.error(error);
        alert('No se pudo cargar la información. Por favor, inténtelo más tarde.');
        return; 
    }

    const botonBuscar = document.querySelector('#btnBuscar');
    const campoBuscar = document.querySelector('#inputBuscar');
    const listaPeliculas = document.querySelector('#lista');
    const detalles = document.querySelector('#detallePeliculas');
    const contenedorInfo = document.querySelector('#desplegable');

    botonBuscar.addEventListener('click', () => {
        const busqueda = campoBuscar.value.trim().toLowerCase();
        listaPeliculas.innerHTML = '';

        if (!busqueda) {
            alert('Por favor ingrese un término de búsqueda.');
            return;
        }

        const peliculasFiltradas = filtrarPeliculas(busqueda);
        peliculasFiltradas.sort((a, b) => a.title.localeCompare(b.title));

        if (peliculasFiltradas.length === 0) {
            listaPeliculas.innerHTML = '<li class="list-group-item"> No se encontraron resultados. </li>';
            return;
        }

        peliculasFiltradas.forEach(pelicula => {
            const calificacionEstrellas = calcularEstrellas(pelicula);
            const elemento = document.createElement('li');
            elemento.classList.add('list-group-item');
            elemento.innerHTML = `
                <h5>${pelicula.title}</h5>
                <p>${pelicula.tagline}</p>
                <p>${'★'.repeat(calificacionEstrellas)}${'☆'.repeat(5 - calificacionEstrellas)} (${pelicula.vote_average} votos)</p>
            `;
            elemento.onclick = () => mostrarDetalles(pelicula);
            listaPeliculas.appendChild(elemento);
        });
    });

    function filtrarPeliculas(busqueda) {
        const coincidencias = peliculas.filter(pelicula => {
            const tituloCoincide = pelicula.title.toLowerCase().includes(busqueda);
            const generoCoincide = pelicula.genres?.some(genero => genero.name.toLowerCase().includes(busqueda));
            return tituloCoincide || generoCoincide;
        });

        if (coincidencias.length > 0) return coincidencias;

        return peliculas.filter(pelicula => {
            const taglineCoincide = pelicula.tagline?.toLowerCase().includes(busqueda);
            const resumenCoincide = pelicula.overview?.toLowerCase().includes(busqueda);
            return taglineCoincide || resumenCoincide;
        });
    }

    function calcularEstrellas(pelicula) {
        let estrellas = Math.round(pelicula.vote_average / 2);
        const popularidad = parseFloat(String(pelicula.popularity).replace(/[.,]/g, ''));

        if (popularidad < 3000000) {
            estrellas = Math.max(0, estrellas - 1);
        } else if (popularidad > 10000000) {
            estrellas = Math.min(5, estrellas + 1);
        }

        return Math.min(5, estrellas);
    }

    function mostrarDetalles(pelicula) {
        document.querySelector('#tituloDetalle').textContent = pelicula.title;
        document.querySelector('#overviewDetalle').textContent = pelicula.overview;
        document.querySelector('#generosDetalle').textContent = pelicula.genres.map(genero => genero.name).join(', ');
        detalles.style.display = 'block';

        contenedorInfo.innerHTML = `
            <button class="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInfo" aria-expanded="false" aria-controls="collapseInfo">
                Más información
            </button>
            <div class="collapse" id="collapseInfo">
                <div class="card card-body">
                    <p><strong>Año de lanzamiento:</strong> ${new Date(pelicula.release_date).getFullYear()}</p>
                    <p><strong>Duración:</strong> ${pelicula.runtime ? `${pelicula.runtime} minutos` : 'Desconocido'}</p>
                    <p><strong>Presupuesto:</strong> ${pelicula.budget ? `$${pelicula.budget.toLocaleString()}` : 'No disponible'}</p>
                    <p><strong>Ganancias:</strong> ${pelicula.revenue ? `$${pelicula.revenue.toLocaleString()}` : 'No disponible'}</p>
                </div>
            </div>
        `;
    }

    document.querySelector('#btnCerrar').onclick = () => {
        detalles.style.display = 'none';
    };
});