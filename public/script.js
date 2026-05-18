// Variables para para la simulación del login y registro 
let testuser = false; 
const testmail = "amorylentejas@red.ujaen.es";
const testkey = "comedorsocial";
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
function FormularioLogin(event){
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
function Crear(event){
    //esto evita la recarga de la pag
    event.preventDefault();
    //nos dice que el botón y la función estan conectados
    console.log("enviando turno creado...");
    //busca los datos en el HTML y lo guarda en la variable corresponciente
    let nombre= document.forms.crear.nombre.value;
    let dia=document.forms.crear.dia.value;
    let grupo=document.forms.crear.grupo.value;
    //crea un objeto de autentificación, mete en el mismo sitio el email, la contraseña y la fecha
    let auth={
        "nombre":nombre,
        "dia": dia,
        "grupo":grupo
    };
    //Guarda los datos en la variable JSON
    let datosJSON = JSON.stringify(auth);
    console.log("Turno creado:", datosJSON);

}

function Modificar(event){
    event.preventDefault(); //Evitar recarga de la pagina
    //Leemos los datos del formulario modificar
    let nombre = document.forms.modificar.nombre.value;
    let dia = document.forms.modificar.dia.value;
    let grupo = document.forms.modificar.grupo.value;
    let auth={
        "nombre":nombre,
        "dia": dia,
        "grupo":grupo
    };
    let datosJSON = JSON.stringify(auth);
    console.log("Turno modificado:", datosJSON);
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

  





