class Apod {
    constructor(titulo, fecha, explicacion, url, tipo) {
        this.titulo = titulo;
        this.fecha = fecha;
        this.explicacion = explicacion;
        this.url = url;
        this.tipo = tipo;
    }
}

const API_KEY = "COU4eqT7BhffmqpVH4Z4z8g6xnY36Gl6PnUw1IL2";
const URL_API = "https://api.nasa.gov/planetary/apod";

const fechaInput = document.getElementById("fecha");
const btnBuscar = document.getElementById("btnBuscar");
const btnHoy = document.getElementById("btnHoy");
const btnFavorito = document.getElementById("btnFavorito");

const mensaje = document.getElementById("mensaje");
const titulo = document.getElementById("titulo");
const fechaApod = document.getElementById("fechaApod");
const mediaContainer = document.getElementById("mediaContainer");
const explicacion = document.getElementById("explicacion");
const listaFavoritos = document.getElementById("listaFavoritos");

let apodActual = null;
let favoritos = JSON.parse(localStorage.getItem("favoritosAPOD")) || [];

const FECHA_MINIMA = "1995-06-16";

function obtenerFechaHoy() {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return anio + "-" + mes + "-" + dia;
}

function iniciarApp() {
    const fechaHoy = obtenerFechaHoy();

    fechaInput.value = fechaHoy;
    fechaInput.max = fechaHoy;
    fechaInput.min = FECHA_MINIMA;

    buscarApod(fechaHoy);
    mostrarFavoritos();

    btnBuscar.addEventListener("click", function () {
        buscarPorFecha();
    });

    btnHoy.addEventListener("click", function () {
        cargarFotoDelDia();
    });

    btnFavorito.addEventListener("click", function () {
        agregarFavorito();
    });
}

function buscarPorFecha() {
    const fechaSeleccionada = fechaInput.value;
    const fechaHoy = obtenerFechaHoy();

    if (fechaSeleccionada === "") {
        mensaje.textContent = "Poner fecha válida.";
        return;
    }

    if (fechaSeleccionada > fechaHoy) {
        mensaje.textContent = "Poner fecha válida.";
        return;
    }

    if (fechaSeleccionada < FECHA_MINIMA) {
        mensaje.textContent = "Poner fecha válida.";
        return;
    }

    mensaje.textContent = "";
    buscarApod(fechaSeleccionada);
}

function cargarFotoDelDia() {
    const fechaHoy = obtenerFechaHoy();

    fechaInput.value = fechaHoy;
    buscarApod(fechaHoy);
}

async function buscarApod(fecha) {
    try {
        mensaje.textContent = "Cargando información de la NASA...";

        const respuesta = await fetch(URL_API + "?api_key=" + API_KEY + "&date=" + fecha);

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar la API");
        }

        const data = await respuesta.json();

        const apod = new Apod(
            data.title,
            data.date,
            data.explanation,
            data.url,
            data.media_type
        );

        apodActual = apod;

        crearCardApod(apod);

        mensaje.textContent = "";

    } catch (error) {
        mensaje.textContent = "Error al consultar la API de la NASA, por demoras de tiempo";
        console.log(error);
    }
}

function crearCardApod(apod) {
    titulo.textContent = apod.titulo;
    fechaApod.textContent = "Fecha: " + apod.fecha;
    explicacion.textContent = apod.explicacion;

    mediaContainer.innerHTML = "";

    if (apod.tipo === "image") {
        mediaContainer.innerHTML = `
            <img src="${apod.url}" alt="${apod.titulo}" class="img-fluid rounded">
        `;
    } else if (apod.tipo === "video") {
        mediaContainer.innerHTML = `
            <iframe 
                src="${apod.url}" 
                title="${apod.titulo}" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        mediaContainer.innerHTML = `
            <p>Este contenido no es una imagen ni un video.</p>
            <a href="${apod.url}" target="_blank">Ver contenido</a>
        `;
    }
}

function agregarFavorito() {
    if (!apodActual) {
        mensaje.textContent = "No hay una imagen para agregar.";
        return;
    }

    const existe = favoritos.some(function (fav) {
        return fav.fecha === apodActual.fecha;
    });

    if (existe) {
        mensaje.textContent = "Esta imagen ya está en tus favoritos.";
        return;
    }

    favoritos.push(apodActual);
    localStorage.setItem("favoritosAPOD", JSON.stringify(favoritos));

    mensaje.textContent = "Agregado a favoritos.";
    mostrarFavoritos();
}

function mostrarFavoritos() {
    listaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = "<p>No tienes favoritos guardados.</p>";
        return;
    }

    favoritos.forEach(function (apod) {
        const divFavorito = document.createElement("div");
        divFavorito.classList.add("favorito-item");

        let mediaFavorito = "";

        if (apod.tipo === "image") {
            mediaFavorito = `<img src="${apod.url}" alt="${apod.titulo}" width="100">`;
        } else if (apod.tipo === "video") {
            mediaFavorito = `<p>Video APOD</p>`;
        }

        divFavorito.innerHTML = `
            ${mediaFavorito}
            <p>${apod.titulo} (${apod.fecha})</p>
            <button class="btn-eliminar">Quitar de favoritos</button>
        `;

        divFavorito.addEventListener("click", function () {
            apodActual = apod;
            fechaInput.value = apod.fecha;
            crearCardApod(apod);
            window.scrollTo(0, 0);
        });

        const btnEliminar = divFavorito.querySelector(".btn-eliminar");

        btnEliminar.addEventListener("click", function (evento) {
            evento.stopPropagation();
            quitarFavorito(apod.fecha);
        });

        listaFavoritos.appendChild(divFavorito);
    });
}

function quitarFavorito(fecha) {
    favoritos = favoritos.filter(function (apod) {
        return apod.fecha !== fecha;
    });

    localStorage.setItem("favoritosAPOD", JSON.stringify(favoritos));

    mostrarFavoritos();

    mensaje.textContent = "Se quitó de favoritos.";
}

iniciarApp();