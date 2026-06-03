// Variables para para la simulación del login y registro 
let testuser = false; 
const testmail = "amorylentejas@red.ujaen.es";
const testkey = "1";
// Definir donde está el servidor
const SERVER_URL = ""; 
const API_LOGIN = SERVER_URL + "/login";
const API_USERS = SERVER_URL + "/voluntarios";
//Funcion para comprobar que el correo introducido es igual al definido
function checking(mail, key)
{
    if(mail === testmail && key===testkey){
        return true;
    }
    else{
        return false;
    }
}
// Función para simular el proceso de registro de un nuevo usuario.Comprueba si el correo ya existe.
function simulatemailing(testmail2)
{
    if(testmail2===testmail)
        {
            return false;
        }
        else{
            return true;
        }
}
//Función para mostrar el error. Tarea 5
function showError(message) {
    //Buscamos el elemento "Cartel_error" y se guarda en memoria bajo el nombre 'div'
  let div = document.getElementById("Error_banner");
    //Buscamos el elemento "message" y se guarda en memoria bajo el nombre 'texto'
  let texto = document.getElementById("message");
  //Vemos si se encuentra el elemento. Si no es null, significa que este existe.
  if (div != null) {
    //Si no es null, existe el elemento y se puede modificar
    if (texto != null) {
        //Nos metemos en html y reemplazamos el texto por el contenido de la variable 'message'
        texto.innerText = message;
    }
    //Quitamos la clase "oculto", que mantenía al elemento invisible 
    div.classList.remove("oculta");
    //Aplicamos la clase "visible" para que se muestre el aviso de error.
    div.classList.add("visible");
    // Aplicamos contador que hará que el error se muestre 5 segundos.
    setTimeout(()=>{
    div.classList.remove("visible");
    div.classList.add("oculta");
        }, 5000);
    }
}

//tarea 3
/*function FormularioLogin(event){
    //esto evita la recarga de la pag
    event.preventDefault();
    //nos dice que el botón y la función estan conectados
    console.log("enviando Inicio de sesión...");
    //busca los datos en el HTML y lo guarda en la variable corresponciente
    let email= document.forms.login.email.value;
    let password=document.forms.login.password.value;
    //crea un objeto de autentificación, mete en el mismo sitio el email, la contraseña y la fecha
    let auth={
        "email":email,
        "password": password,
        "times tamp":Date.now()
    };
    //Guarda los datos en la variable JSON
    let datosJSON = JSON.stringify(auth);
    if ((checking(email, password) === true)) {
        console.log("usuario registrado");
        testuser = true;
        let clasesprivadas = document.querySelectorAll(".menuprivado");
        if (clasesprivadas != null) {
            for (let clases of clasesprivadas) {
                clases.classList.remove("oculta");
            }
        }
            document.getElementById("nav-3").classList.add("oculta");
            document.getElementById("nav-4").classList.add("oculta");
    }
    else {
        showError("El correo o la contraseña no son correctos.");
    }
}
*/

//tarea 2 de FASE 4
// TAREA 2: Nueva función de login conectada al Back-End
function FormularioLogin(event){
    // Esto evita la recarga de la página
    event.preventDefault();
    console.log("Enviando Inicio de sesión al servidor...");
    
    // Busca los datos en el HTML
    let email = document.forms.login.email.value;
    let password = document.forms.login.password.value;
    
    // Empaquetamos los datos. OJO: El servidor espera "user", no "email".
    let auth = {
        "user": email, 
        "password": password
    };
    
    // Hacemos la petición real al backend usando fetch()
    fetch(API_LOGIN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(auth)
    })
    .then(function(response) {
        if (response.status === 200) {
            console.log("Usuario autenticado con éxito en el servidor.");
            testuser = true; 
            
            // Lógica visual para mostrar el menú privado (igual que en tu fase anterior)
            let clasesprivadas = document.querySelectorAll(".menuprivado");
            if (clasesprivadas != null) {
                for (let clases of clasesprivadas) {
                    clases.classList.remove("oculta");
                }
            }
            document.getElementById("nav-3").classList.add("oculta");
            document.getElementById("nav-4").classList.add("oculta");
            
            // Llevamos al usuario a la pantalla principal tras loguearse
            showSection("1"); 
            
        } else {
            // Si el servidor devuelve 401 (No autorizado) o 400 (Mal formato)
            showError("El correo o la contraseña no son correctos.");
        }
    })
    .catch(function(error) {
        // Por si el servidor está apagado o falla la red
        console.error("Error de conexión:", error);
        showError("No hay conexión con el servidor.");
    });
} //Hasta aqui la tarea 2 de fase 4


// Tarea 3 Fase 4: Registro de usuarios
async function doCreateUser(event) {

    // Evita que se recargue la página al enviar el formulario
    event.preventDefault();

    console.log("Enviando registro al servidor...");

    // Recogemos los datos del formulario
    let usuario = document.forms.registro.usuario.value;
    let email = document.forms.registro.email.value;
    let nombre = document.forms.registro.nombre.value;
    let apellidos = document.forms.registro.apellidos.value;
    let password = document.forms.registro.password.value;
    let comprobacion = document.forms.registro.comprobacion.value;

    // Comprobamos que las contraseñas coinciden antes de enviar nada al servidor
    if (password !== comprobacion) {
        showError("La contraseña y su comprobación no coinciden.");
        return;
    }

    // Creamos el objeto usuario que se enviará al backend
    let user = {
        user: email,
        usuario: usuario,
        name: nombre,
        apellidos: apellidos,
        password: password
    };

    // Llamamos a la función que hace el POST /users
    let userId = await createUser(user);

    if (userId != null) {
        console.log("Usuario creado con id:", userId);
        alert("Usuario registrado correctamente.");

        // Después de registrarse, mandamos al usuario al login
        showSection("3");

    } else {
        showError("No se ha podido registrar el usuario.");
    }
}

// 2ªParte funcion Crear usuarios: Envía los datos al endpoint POST /users.
async function createUser(user) {

    let init = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    };

    let response = await fetch(API_USERS, init);

    if (response.ok) {
        return await response.json();
    } else {
        console.log("Error al crear usuario. Código:", response.status);
        return null;
    }
}
//Fin de la tarea 3

function Registro(event){
    //esto evita la recarga de la pag
    event.preventDefault();
    //nos dice que el botón y la función estan conectados
    console.log("enviando registro...");
    //busca los datos en el HTML y lo guarda en la variable correspondiente
    let usuario= document.forms.registro.usuario.value;
    let email= document.forms.registro.email.value;
    let nombre= document.forms.registro.nombre.value;
    let apellidos= document.forms.registro.apellidos.value;
    let password=document.forms.registro.password.value;
    let comprobacion= document.forms.registro.comprobacion.value;
    if (password===comprobacion) {
        //crea un objeto de autentificación, mete en el mismo sitio el email, la contraseña y la fecha
        let auth={
            "usuario":usuario,
            "email":email,
            "nombre":nombre,
            "apellidos":apellidos,
            "password": password,
            "comprobacion":comprobacion
        };
        //Guarda los datos en la variable JSON
        let datosJSON = JSON.stringify(auth);
        console.log("Registrado:"); 
    }
    else {
        showError("La contraseña y su comprobación no coinciden.");
    }

    //crea un objeto de autentificación, mete en el mismo sitio el email, la contraseña y la fecha
    

}

//Dinamización de las secciones 
var activeSection = "1";

function showSection(sectionId) {

    console.log("Mostrar sección " + sectionId);

    //  Ocultamos  las secciones
    let sections = document.getElementsByTagName("section");
    //Secciones ocultas para quien no se haya registrado
    let seccionesocultas = ["6","7","8" ] 
    if(seccionesocultas.includes(sectionId) && testuser === false){
        showError("Hay que iniciar sesión para acceder a esta sección.");
        return;
    }
    // Ocultamos todas las secciones
    if (sections != null) {
        for (let s of sections) {
            s.classList.add("oculta");
        }
    }

    //  Mostramos la sección seleccionada
    let section = document.getElementById("sec-" + sectionId);
    section.classList.remove("oculta");

    // Quitar active a todos los links
    let links = document.querySelectorAll("[id^=nav-]");

    if (links != null) {
        for (let link of links) {
            link.classList.remove("active");
            
        }
    }

    // Activar el link seleccionado
    let link = document.getElementById("nav-" + sectionId);
    link.classList.add("active");
  
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



/* ========================= */
/* SECCIONES 6 Y 8 - TURNOS  */
/* ========================= */

// Lista de turnos disponibles en la tabla.
// Cada objeto representa una celda de la tabla.
let turnos = [
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

// Cuando cargue la página, se preparan los eventos de la tabla y botones.
window.addEventListener("load", function () {
	iniciarTurnos();
});

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
		botonConfirmar.addEventListener("click", function () {
			confirmarTurnos();
		});
	}

	let botonCambiar = document.getElementById("btn-cambiar-turno");

	if (botonCambiar != null) {
		botonCambiar.addEventListener("click", function () {
			cambiarTurno();
		});
	}

	actualizarPantallaTurnos();
}

function buscarTurno(idTurno) {

	for (let i = 0; i < turnos.length; i++) {

		if (turnos[i].id === idTurno) {
			return turnos[i];
		}
	}

	return null;
}

function marcarTurno(idTurno) {

	let turno = buscarTurno(idTurno);

	if (turno == null) {
		return;
	}

	if (turno.estado === "reservado") {
		showError("Ese turno ya está reservado.");
		return;
	}

	if (turno.estado === "libre") {
		turno.estado = "marcado";
	} else {
		turno.estado = "libre";
	}

	actualizarPantallaTurnos();
}

function confirmarTurnos() {

	let contador = 0;

	for (let i = 0; i < turnos.length; i++) {

		if (turnos[i].estado === "marcado") {
			turnos[i].estado = "reservado";
			contador++;
		}
	}

	if (contador === 0) {
		showError("No has seleccionado ningún turno.");
		return;
	}

	actualizarPantallaTurnos();
	console.log("Turnos actualizados:", turnos);
}

function eliminarTurno(idTurno) {

	let turno = buscarTurno(idTurno);

	if (turno != null && turno.estado === "reservado") {
		turno.estado = "libre";
	}

	actualizarPantallaTurnos();
}

function cambiarTurno() {

	let selectActual = document.getElementById("turno-actual");
	let selectNuevo = document.getElementById("turno-nuevo");

	if (selectActual == null || selectNuevo == null) {
		return;
	}

	let idActual = selectActual.value;
	let idNuevo = selectNuevo.value;

	if (idActual === "" || idNuevo === "") {
		showError("Selecciona el turno reservado y el nuevo turno disponible.");
		return;
	}

	let turnoActual = buscarTurno(idActual);
	let turnoNuevo = buscarTurno(idNuevo);

	if (turnoActual == null || turnoNuevo == null) {
		showError("No se ha podido realizar el cambio.");
		return;
	}

	if (turnoActual.estado !== "reservado") {
		showError("El turno que quieres cambiar ya no está reservado.");
		return;
	}

	if (turnoNuevo.estado !== "libre") {
		showError("El nuevo turno ya no está libre.");
		return;
	}

	turnoActual.estado = "libre";
	turnoNuevo.estado = "reservado";

	actualizarPantallaTurnos();
	console.log("Cambio realizado:", turnos);
}

function actualizarPantallaTurnos() {

	actualizarTablaTurnos();
	mostrarTurnosReservados();
	actualizarSelectoresCambio();
}

function actualizarTablaTurnos() {

	for (let i = 0; i < turnos.length; i++) {

		let celda = document.getElementById(turnos[i].id);

		if (celda != null) {

			celda.classList.remove("libre");
			celda.classList.remove("marcado");
			celda.classList.remove("reservado");

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

	if (lista == null) {
		return;
	}

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

	if (selectActual == null || selectNuevo == null) {
		return;
	}

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

/* ========================================= */
/* TAREA 4 FASE 4 - OBTENER LISTA DE USUARIOS*/
/* ========================================= */

// 1. Función asíncrona para pedir la lista al servidor
async function obtenerUsuarios() {
    console.log("Solicitando lista de usuarios al servidor...");

    // Se añade un parámetro de consulta (?limit=50) para cumplir 
    // con la valoración positiva de la práctica (Tarea 4.5 del back-end)
    let urlConFiltro = API_USERS + "?limit=50";

    try {
        let response = await fetch(urlConFiltro, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            let listaUsuarios = await response.json();
            mostrarUsuarios(listaUsuarios);
        } else {
            console.log("Error al obtener usuarios. Código:", response.status);
            showError("No se pudo obtener el listado de usuarios.");
        }
    } catch (error) {
        console.error("Error de red al intentar listar usuarios:", error);
        showError("No hay conexión con el servidor.");
    }
}

// 2. Función que recibe el array JSON y lo recorre
function mostrarUsuarios(listaUsuarios) {
    let contenedor = document.getElementById("lista-usuarios-contenedor");
    
    if (contenedor == null) {
        return; // Prevención de errores si el div no existe
    }

    // Limpiamos la lista antes de volver a llenarla
    contenedor.innerHTML = ""; 

    // Recorremos el array JSON de usuarios devuelto por la base de datos
    for (let i = 0; i < listaUsuarios.length; i++) {
        let elementoHTML = crearElementoUsuario(listaUsuarios[i]);
        contenedor.appendChild(elementoHTML);
    }
}

// 3. Función auxiliar para fabricar cada nodo del DOM y sus botones
function crearElementoUsuario(usuario) {
    // Contenedor individual para cada usuario
    let divUsuario = document.createElement("div");
    divUsuario.classList.add("usuario-item"); // Puedes darle estilos en tu CSS
    
    // Le asignamos como ID el propio _id de MongoDB (Crucial para las Tareas 5 y 6)
    divUsuario.id = "user-" + usuario._id;

    // Texto con los datos básicos
    let texto = document.createElement("span");
    texto.textContent = usuario.name + " " + usuario.apellidos + " (" + usuario.user + ") ";

    // Botón para mostrar detalles (Preparación para la Tarea 5)
    let btnDetalles = document.createElement("button");
    btnDetalles.textContent = "Ver Detalles";
    btnDetalles.type = "button";
    btnDetalles.addEventListener("click", function() {
        // Aquí irá la lógica de la Tarea 5
        console.log("Mostrando detalles del usuario:", usuario._id);
    });

    // Botón para borrar elemento (Preparación para la Tarea 6)
    let btnBorrar = document.createElement("button");
    btnBorrar.textContent = "Eliminar";
    btnBorrar.type = "button";
    btnBorrar.addEventListener("click", function() {
        // Aquí irá la lógica de la Tarea 6
        console.log("Eliminando usuario:", usuario._id);
    });

    // Ensamblamos el nodo
    divUsuario.appendChild(texto);
    divUsuario.appendChild(btnDetalles);
    divUsuario.appendChild(btnBorrar);

    return divUsuario;
}
/* ========================================= */
/* TAREA 5 FASE 4 - MOSTRAR DETALLES (MODAL) */
/* ========================================= */

// Función asíncrona para solicitar un usuario específico
async function verDetallesUsuario(idUsuario) {
    console.log("Solicitando detalles del usuario con ID: " + idUsuario);

    // Se concatena la URL base con el ID. Ejemplo: /users/64a...
    let urlDetalles = API_USERS + "/" + idUsuario;

    try {
        let response = await fetch(urlDetalles, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            let usuario = await response.json();
            abrirModalDetalles(usuario);
        } else if (response.status === 404) {
            showError("El usuario solicitado no existe.");
        } else {
            console.log("Error al obtener detalles. Código:", response.status);
            showError("No se pudo obtener la información del voluntario.");
        }
    } catch (error) {
        console.error("Error de red al intentar ver detalles:", error);
        showError("No hay conexión con el servidor.");
    }
}

// Función para inyectar los datos en el HTML y abrir el modal
function abrirModalDetalles(usuario) {
    let modal = document.getElementById("modal-detalles-usuario");
    let contenido = document.getElementById("contenido-detalles");

    if (modal != null && contenido != null) {
        // Limpiamos contenido anterior e inyectamos el nuevo
        // Usamos los campos que definiste en tu formulario de registro (name, apellidos, user)
        contenido.innerHTML = `
            <p><strong>ID de base de datos:</strong> ${usuario._id}</p>
            <p><strong>Correo (Usuario):</strong> ${usuario.user}</p>
            <p><strong>Nombre:</strong> ${usuario.name || 'No especificado'}</p>
            <p><strong>Apellidos:</strong> ${usuario.apellidos || 'No especificado'}</p>
        `;

        // El método nativo showModal() bloquea el resto de la página
        modal.showModal();
    }
}

// Función para cerrar el cuadro de diálogo
function cerrarModalDetalles() {
    let modal = document.getElementById("modal-detalles-usuario");
    if (modal != null) {
        modal.close(); // Método nativo para cerrar el modal
    }
}
// Botón para mostrar detalles (Tarea 5)
    let btnDetalles = document.createElement("button");
    btnDetalles.textContent = "Ver Detalles";
    btnDetalles.type = "button";
    
    // Aquí usamos la función flecha como callback para guardar el contexto de 'usuario._id'
    btnDetalles.addEventListener("click", () => {
        verDetallesUsuario(usuario._id);
    });

    