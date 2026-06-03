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
// TAREA 3: REGISTRO DE NUEVOS VOLUNTARIOS
// ==========================================

// Función que recoge los datos introducidos en el formulario de registro y comprueba que la contraseña y su confirmación coinciden.
async function doCreateUser(event) {
    event.preventDefault();
    console.log("Enviando registro al servidor...");

    // Obtención de los datos introducidos por el usuario
    let usuario = document.forms.registro.usuario.value;
    let email = document.forms.registro.email.value;
    let nombre = document.forms.registro.nombre.value;
    let apellidos = document.forms.registro.apellidos.value;
    let password = document.forms.registro.password.value;
    let comprobacion = document.forms.registro.comprobacion.value;

    // Validación de la contraseña
    if (password !== comprobacion) {
        showError("La contraseña y su comprobación no coinciden.");
        return;
    }

    // Creación del objeto JSON que se enviará al servidor
    let user = {
        user: email,
        usuario: usuario,
        name: nombre,
        apellidos: apellidos,
        password: password
    };

    // Llamada a la función encargada de enviar los datos al backend
    let userId = await createUser(user);

    // Comprobación del resultado del registro
    if (userId != null) {
        alert("Usuario registrado correctamente.");
        showSection("3");
    } else {
        showError("No se ha podido registrar el usuario.");
    }
}

// Función que realiza la petición POST al endpoint /voluntarios
// para almacenar un nuevo usuario en la base de datos MongoDB.
async function createUser(user) {

    // Configuración de la petición HTTP
    let init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    };

    // Envío de la petición al servidor
    let response = await fetch(API_USERS, init);

    // Si el servidor responde correctamente, devuelve el usuario creado
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}


// NAVEGACIÓN DE SECCIONES (MENÚ)
// Función encargada de mostrar la sección seleccionada del menu y ocultar el resto de secciones de la aplicación.
function showSection(sectionId) {

    // Obtiene todas las secciones de la página
    let sections = document.getElementsByTagName("section");
//Ocultamos estas secciones porque para acceder a ellas hay que autentificarse     
    // Comprueba si el usuario ha iniciado sesión antes de acceder
    // a las secciones privadas de la aplicación.
    if(seccionesocultas.includes(sectionId) && testuser === false){
        showError("Hay que iniciar sesión para acceder a esta sección.");
        return;
    }

    // Oculta todas las secciones
    if (sections != null) {
        for (let s of sections) {
            s.classList.add("oculta");
        }
    }

    // Muestra únicamente la sección seleccionada
    let section = document.getElementById("sec-" + sectionId);
    if (section) section.classList.remove("oculta");

    // Elimina la clase active de todos los enlaces del menú
    let links = document.querySelectorAll("[id^=nav-]");
    if (links != null) {
        for (let link of links) {
            link.classList.remove("active");
        }
    }

    // Marca como activa la opción seleccionada
    let link = document.getElementById("nav-" + sectionId);
    if (link) link.classList.add("active");
}
// Se ejecuta al cargar la página web
window.onload=function(){
    // Oculta inicialmente todas las opciones privadas del menú
    let clasesprivadas = document.querySelectorAll(".menuprivado");
    if(clasesprivadas != null) {
        for(let clases of clasesprivadas) {
            clases.classList.add("oculta");
        }
    }
    // Muestra la sección de inicio al abrir la aplicación
    showSection(1);
};
// Array que almacena todos los turnos disponibles y reservados
let turnos = [];

// TAREA 4 (READ)
// Al cargar la página se obtiene la información de los turnos reservados
// almacenados en MongoDB y se fusiona con la plantilla local de turnos.
window.addEventListener("load", async function () {
    console.log("Cargando plantilla de turnos...");

    // Carga la plantilla inicial con los 15 turnos disponibles
    cargarTurnosDePrueba(); 

    try {
        // Petición GET al servidor para obtener los turnos reservados
        let response = await fetch(API_TURNOS, { method: "GET" });
         if (response.ok) {

            // Convierte la respuesta JSON en un array de objetos
            let turnosReservados = await response.json();
             // Marca como reservados los turnos existentes en MongoDB
            for (let i = 0; i < turnosReservados.length; i++) {

                let turnoMio = buscarTurno(turnosReservados[i].id);

                if (turnoMio != null) {
                    turnoMio.estado = "reservado";
                }
            }

            // Actualiza la interfaz gráfica con los datos recibidos
            actualizarPantallaTurnos();
        }

    } catch (error) {
        console.error("Fallo al conectar con el servidor de turnos.");
    }
});


// Turnos disponibles 
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

    // Inicializa los eventos y la interfaz de los turnos
    iniciarTurnos();
}


// Asocia los eventos necesarios a los elementos de la tabla
// y a los botones de gestión de turnos.
function iniciarTurnos() {

    // Añade un evento click a cada celda de turno
    for (let i = 0; i < turnos.length; i++) {

        let celda = document.getElementById(turnos[i].id);

        if (celda != null) {

            celda.addEventListener("click", function () {
                marcarTurno(turnos[i].id);
            });
        }
    }

    // Botón para confirmar reservas 
    let botonConfirmar = document.getElementById("btn-confirmar-turnos");
    if (botonConfirmar != null) {
        botonConfirmar.addEventListener("click", confirmarTurnos);
    }
    // Botón para modificar reservas
    let botonCambiar = document.getElementById("btn-cambiar-turno");
    if (botonCambiar != null) {
        botonCambiar.addEventListener("click", cambiarTurno);
    }
    actualizarPantallaTurnos();
}
// Busca un turno concreto dentro del array mediante su identificador
function buscarTurno(idTurno) {

    for (let i = 0; i < turnos.length; i++) {

        if (turnos[i].id === idTurno) {
            return turnos[i];
        }
    }

    return null;
}
// Marca o desmarca un turno seleccionado por el usuario
function marcarTurno(idTurno) {
    let turno = buscarTurno(idTurno);
    if (turno == null) return;
    // Impide seleccionar un turno ya reservado
    if (turno.estado === "reservado") {

        showError("Ese turno ya está reservado.");
        return;
    }
 // Alterna entre seleccionado y disponible
    turno.estado = (turno.estado === "libre") ? "marcado" : "libre";
    actualizarPantallaTurnos();
}

// TAREA 3 (CREATE)
// Envía mediante una petición POST los turnos seleccionados  y se almacenan en MongoDB
async function confirmarTurnos() {
    let contador = 0;
    for (let i = 0; i < turnos.length; i++) {
        if (turnos[i].estado === "marcado") {
            // Datos que se enviarán al servidor
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

                // Si el servidor responde correctamente, el turno pasa a estado reservado.
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

    // Comprueba si se ha reservado algún turno
    if (contador === 0) {
        showError("No has seleccionado ningún turno.");
    } else {
        alert("¡Has reservado " + contador + " turnos con éxito!");
    }
    actualizarPantallaTurnos();
}

// TAREA 6 (DELETE)
// Envía una petición DELETE al servidor para eliminar una reserva previamente almacenada en MongoDB.
async function eliminarTurno(idTurno) {
 // Construye la URL del turno que se quiere eliminar
    let url = API_TURNOS + "/" + idTurno;

    try {

        // Petición DELETE al endpoint correspondiente
        let response = await fetch(url, { method: "DELETE" });
        if (response.ok) {
            // Si se borra correctamente, el turno vuelve a estar disponible.
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