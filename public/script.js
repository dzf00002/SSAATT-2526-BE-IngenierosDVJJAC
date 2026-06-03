// ==========================================
// CONFIGURACIÓN Y VARIABLES
// ==========================================
let testuser = false; 
const SERVER_URL = ""; 
const API_LOGIN = SERVER_URL + "/login";
const API_USERS = SERVER_URL + "/voluntarios";
const API_TURNOS = SERVER_URL + "/turnos";

// Función para mostrar errores (Cartel rojo)
function showError(message) {
  let div = document.getElementById("Error_banner");
  let texto = document.getElementById("message");
  if (div != null) {
    if (texto != null) {
        texto.innerText = message;
    }
    div.classList.remove("oculta");
    div.classList.add("visible");
    setTimeout(()=>{
        div.classList.remove("visible");
        div.classList.add("oculta");
    }, 5000);
  }
}

// ==========================================
// TAREA 2: LOGIN 
// ==========================================
function FormularioLogin(event){
    event.preventDefault();
    console.log("Enviando Inicio de sesión al servidor...");
    
    let email = document.forms.login.email.value;
    let password = document.forms.login.password.value;
    let auth = { "user": email, "password": password };
    
    fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth)
    })
    .then(function(response) {
        if (response.status === 200) {
            console.log("Usuario autenticado con éxito.");
            testuser = true; 
            let clasesprivadas = document.querySelectorAll(".menuprivado");
            if (clasesprivadas != null) {
                for (let clases of clasesprivadas) {
                    clases.classList.remove("oculta");
                }
            }
            document.getElementById("nav-3").classList.add("oculta");
            document.getElementById("nav-4").classList.add("oculta");
            showSection("1"); 
        } else {
            showError("El correo o la contraseña no son correctos.");
        }
    })
    .catch(function(error) {
        showError("No hay conexión con el servidor.");
    });
}

// ==========================================
// TAREA 3: REGISTRO 
// ==========================================
async function doCreateUser(event) {
    event.preventDefault();
    console.log("Enviando registro al servidor...");

    let usuario = document.forms.registro.usuario.value;
    let email = document.forms.registro.email.value;
    let nombre = document.forms.registro.nombre.value;
    let apellidos = document.forms.registro.apellidos.value;
    let password = document.forms.registro.password.value;
    let comprobacion = document.forms.registro.comprobacion.value;

    if (password !== comprobacion) {
        showError("La contraseña y su comprobación no coinciden.");
        return;
    }

    let user = {
        user: email,
        usuario: usuario,
        name: nombre,
        apellidos: apellidos,
        password: password
    };

    let userId = await createUser(user);

    if (userId != null) {
        alert("Usuario registrado correctamente.");
        showSection("3");
    } else {
        showError("No se ha podido registrar el usuario.");
    }
}

async function createUser(user) {
    let init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    };
    let response = await fetch(API_USERS, init);
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}

// ==========================================
// NAVEGACIÓN DE SECCIONES (MENÚ)
// ==========================================
function showSection(sectionId) {
    let sections = document.getElementsByTagName("section");
    let seccionesocultas = ["6","7","8" ] 
    if(seccionesocultas.includes(sectionId) && testuser === false){
        showError("Hay que iniciar sesión para acceder a esta sección.");
        return;
    }
    if (sections != null) {
        for (let s of sections) {
            s.classList.add("oculta");
        }
    }
    let section = document.getElementById("sec-" + sectionId);
    if (section) section.classList.remove("oculta");

    let links = document.querySelectorAll("[id^=nav-]");
    if (links != null) {
        for (let link of links) {
            link.classList.remove("active");
        }
    }
    let link = document.getElementById("nav-" + sectionId);
    if (link) link.classList.add("active");
}

window.onload=function(){
    let clasesprivadas = document.querySelectorAll(".menuprivado");
    if(clasesprivadas != null) {
        for(let clases of clasesprivadas) {
            clases.classList.add("oculta");
        }
    }
    showSection(1);
};

// ==========================================
// SECCIONES 6 Y 8: TURNOS (CRUD CON MONGODB)
// ==========================================
let turnos = [];

// TAREA 4 (Leer): Cargar la plantilla y fusionarla con los datos de MongoDB
window.addEventListener("load", async function () {
    console.log("Cargando plantilla de turnos...");
    cargarTurnosDePrueba(); 

    try {
        let response = await fetch(API_TURNOS, { method: "GET" });
        if (response.ok) {
            let turnosReservados = await response.json();
            
            for (let i = 0; i < turnosReservados.length; i++) {
                let turnoMio = buscarTurno(turnosReservados[i].id);
                if (turnoMio != null) {
                    turnoMio.estado = "reservado";
                }
            }
            actualizarPantallaTurnos(); 
        }
    } catch (error) {
        console.error("Fallo al conectar con el servidor de turnos.");
    }
});

// Plantilla base de los 15 huecos
function cargarTurnosDePrueba() {
    turnos = [
        { id: "turno-lunes-desayuno", dia: "Lunes", comida: "Desayuno", estado: "libre" },
        { id: "turno-martes-desayuno", dia: "Martes", comida: "Desayuno", estado: "libre" },
        { id: "turno-miercoles-desayuno", dia: "Miércoles", comida: "Desayuno", estado: "libre" },
        { id: "turno-jueves-desayuno", dia: "Jueves", comida: "Desayuno", estado: "libre" },
        { id: "turno-viernes-desayuno", dia: "Viernes", comida: "Desayuno", estado: "libre" },

        { id: "turno-lunes-comida", dia: "Lunes", comida: "Comida", estado: "libre" },
        { id: "turno-martes-comida", dia: "Martes", comida: "Comida", estado: "libre" },
        { id: "turno-miercoles-comida", dia: "Miércoles", comida: "Comida", estado: "libre" },
        { id: "turno-jueves-comida", dia: "Jueves", comida: "Comida", estado: "libre" },
        { id: "turno-viernes-comida", dia: "Viernes", comida: "Comida", estado: "libre" },

        { id: "turno-lunes-cena", dia: "Lunes", comida: "Cena", estado: "libre" },
        { id: "turno-martes-cena", dia: "Martes", comida: "Cena", estado: "libre" },
        { id: "turno-miercoles-cena", dia: "Miércoles", comida: "Cena", estado: "libre" },
        { id: "turno-jueves-cena", dia: "Jueves", comida: "Cena", estado: "libre" },
        { id: "turno-viernes-cena", dia: "Viernes", comida: "Cena", estado: "libre" }
    ];
    iniciarTurnos();
}

function iniciarTurnos() {
    for (let i = 0; i < turnos.length; i++) {
        let celda = document.getElementById(turnos[i].id);
        if (celda != null) {
            celda.addEventListener("click", function () {
                marcarTurno(turnos[i].id);
            });
        }
    }
    let botonConfirmar = document.getElementById("btn-confirmar-turnos");
    if (botonConfirmar != null) {
        botonConfirmar.addEventListener("click", confirmarTurnos);
    }
    let botonCambiar = document.getElementById("btn-cambiar-turno");
    if (botonCambiar != null) {
        botonCambiar.addEventListener("click", cambiarTurno);
    }
    actualizarPantallaTurnos();
}

function buscarTurno(idTurno) {
    for (let i = 0; i < turnos.length; i++) {
        if (turnos[i].id === idTurno) return turnos[i];
    }
    return null;
}

function marcarTurno(idTurno) {
    let turno = buscarTurno(idTurno);
    if (turno == null) return;
    if (turno.estado === "reservado") {
        showError("Ese turno ya está reservado.");
        return;
    }
    turno.estado = (turno.estado === "libre") ? "marcado" : "libre";
    actualizarPantallaTurnos();
}

// TAREA 3 (Crear): Confirmar reservas enviándolas por POST a MongoDB
async function confirmarTurnos() {
    let contador = 0;

    for (let i = 0; i < turnos.length; i++) {
        if (turnos[i].estado === "marcado") {
            let datosReserva = {
                id: turnos[i].id,
                dia: turnos[i].dia,
                comida: turnos[i].comida
            };

            try {
                let response = await fetch(API_TURNOS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosReserva)
                });

                if (response.ok) {
                    turnos[i].estado = "reservado";
                    contador++;
                } else {
                    showError("Error al guardar en el servidor.");
                }
            } catch (error) {
                showError("Fallo de conexión al guardar.");
            }
        }
    }

    if (contador === 0) {
        showError("No has seleccionado ningún turno.");
    } else {
        alert("¡Has reservado " + contador + " turnos con éxito!");
    }
    actualizarPantallaTurnos();
}

// TAREA 6 (Borrar): Anular reserva con DELETE
async function eliminarTurno(idTurno) {
    let url = API_TURNOS + "/" + idTurno;
    try {
        let response = await fetch(url, { method: "DELETE" });
        if (response.ok) {
            let turno = buscarTurno(idTurno);
            if (turno != null && turno.estado === "reservado") {
                turno.estado = "libre";
            }
            actualizarPantallaTurnos();
        } else {
            showError("No se pudo anular la reserva.");
        }
    } catch (error) {
        showError("Error de conexión al intentar borrar.");
    }
}

// TAREA 7: Modificar un turno existente con PUT
async function cambiarTurno() {
    let selectActual = document.getElementById("turno-actual");
    let selectNuevo = document.getElementById("turno-nuevo");
    if (selectActual == null || selectNuevo == null) return;
    
    let idActual = selectActual.value;
    let idNuevo = selectNuevo.value;

    if (idActual === "" || idNuevo === "") {
        showError("Selecciona el turno reservado y el nuevo turno disponible.");
        return;
    }
    
    let turnoActual = buscarTurno(idActual);
    let turnoNuevo = buscarTurno(idNuevo);
    
    if (turnoActual == null || turnoNuevo == null) return;
    
    if (turnoActual.estado !== "reservado") {
        showError("El turno que quieres cambiar ya no está reservado.");
        return;
    }
    if (turnoNuevo.estado !== "libre") {
        showError("El nuevo turno ya no está libre.");
        return;
    }

    // 1. Preparamos los datos del NUEVO turno que queremos guardar
    let nuevosDatos = {
        id: turnoNuevo.id,
        dia: turnoNuevo.dia,
        comida: turnoNuevo.comida,
        estado: "reservado"
    };

    // 2. Apuntamos a la URL del VIEJO turno para que el servidor sepa cuál modificar
    let url = API_TURNOS + "/" + idActual;

    try {
        console.log("Modificando turno en el servidor de", idActual, "a", idNuevo);
        
        // 3. Hacemos la petición PUT
        let response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevosDatos)
        });

        // 4. Si el servidor nos da el OK, actualizamos la pantalla
        if (response.ok) {
            console.log("Turno modificado correctamente en la base de datos.");
            
            turnoActual.estado = "libre"; // Liberamos el viejo
            turnoNuevo.estado = "reservado"; // Ocupamos el nuevo
            actualizarPantallaTurnos();
            
            alert("¡Turno cambiado con éxito en la base de datos!");
        } else {
            showError("No se pudo modificar el turno en el servidor.");
        }
    } catch (error) {
        console.error("Error al hacer el PUT:", error);
        showError("Error de conexión al intentar cambiar el turno.");
    }
}


// Funciones visuales para actualizar la tabla
function actualizarPantallaTurnos() {
    actualizarTablaTurnos();
    mostrarTurnosReservados();
    actualizarSelectoresCambio();
}

function actualizarTablaTurnos() {
    for (let i = 0; i < turnos.length; i++) {
        let celda = document.getElementById(turnos[i].id);
        if (celda != null) {
            celda.classList.remove("libre", "marcado", "reservado");
            if (turnos[i].estado === "libre") {
                celda.textContent = "Disponible";
                celda.classList.add("libre");
            }
            if (turnos[i].estado === "marcado") {
                celda.textContent = "Seleccionado";
                celda.classList.add("marcado");
            }
            if (turnos[i].estado === "reservado") {
                celda.textContent = "Reservado";
                celda.classList.add("reservado");
            }
        }
    }
}

function mostrarTurnosReservados() {
    let lista = document.getElementById("lista-turnos");
    if (lista == null) return;
    lista.innerHTML = "";
    for (let i = 0; i < turnos.length; i++) {
        if (turnos[i].estado === "reservado") {
            let elemento = document.createElement("li");
            elemento.textContent = turnos[i].dia + " - " + turnos[i].comida;
            let botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.type = "button";
            botonEliminar.classList.add("boton-lista");
            botonEliminar.addEventListener("click", function () {
                eliminarTurno(turnos[i].id);
            });
            elemento.appendChild(botonEliminar);
            lista.appendChild(elemento);
        }
    }
}

function actualizarSelectoresCambio() {
    let selectActual = document.getElementById("turno-actual");
    let selectNuevo = document.getElementById("turno-nuevo");
    if (selectActual == null || selectNuevo == null) return;
    selectActual.innerHTML = "";
    selectNuevo.innerHTML = "";
    crearOpcionInicial(selectActual, "Selecciona un turno reservado");
    crearOpcionInicial(selectNuevo, "Selecciona un turno libre");
    for (let i = 0; i < turnos.length; i++) {
        if (turnos[i].estado === "reservado") {
            crearOpcion(selectActual, turnos[i]);
        }
        if (turnos[i].estado === "libre") {
            crearOpcion(selectNuevo, turnos[i]);
        }
    }
}

function crearOpcionInicial(select, texto) {
    let opcion = document.createElement("option");
    opcion.value = "";
    opcion.textContent = texto;
    select.appendChild(opcion);
}

function crearOpcion(select, turno) {
    let opcion = document.createElement("option");
    opcion.value = turno.id;
    opcion.textContent = turno.dia + " - " + turno.comida;
    select.appendChild(opcion);
}