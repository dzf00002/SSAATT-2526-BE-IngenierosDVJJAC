/*
 * Fase 3 - Tarea 2 - Aplicación básica con servicio login
 * ASIGNATURA: Servicios y Aplicaciones Telemáticas
 * TITULACIÓN: Grado en Ingeniería de tecnologías de telecomunicación (14312020)
 * TITULACIÓN: Doble Grado Ing. de tecnologías de la telecomunicación e Ing. telemática (15212007)
 * TITULACIÓN: Grado en Ingeniería telemática (14512016)
 * CENTRO: ESCUELA POLITÉCNICA SUPERIOR (LINARES)
 * CURSO ACADÉMICO: 2025-2026
 * AUTOR: Juan Carlos Cuevas Martínez
 */

// Datos del servicio
const VERSION = "1.0"; // Variable para indicar la versión del servicio
const SERVICE_NAME = "Nombre del servicio"; // Reemplazar por el nombre del servicio de cada equipo
const SERVICE_PORT = 8081; // Puerto para el servicio HTTP

// Definición de códigos de estado que emplea la aplicación
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_NOTFOUND = 404;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_SERVER_ERROR = 500;

/* Módulos de Nonde.js para desplegar el servidor */
const os = require("node:os"); // Módulo de información relativa al sistema operativo y el host
const dns = require("node:dns"); // Módulo para emplear el servicio DNS

const express = require("express"); //Importación del paquete Express

const app = new express(); // Creación de la aplicación Express

app.use(express.json()); // Para procesar tipos de datos application/json.
// Esto permite que en el objeto Request (req) se pueda emplear la propiedad req.body para
// acceder a cada propiedad del cuerpo de la petición por su nombre.

//Primer endpoint - Punto de entrada genérico al servidor para guardar registro de las peticiones entrantes
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante:" + req.method + " " + req.path);
  next(); //Hace que se pase el proceso al siguiente endpoint que coincida
});

// API del servicio

/*Servicio de autenticación POST /login
datos:
{
    "user": nombre de usuario,
    "password": clave del usuario
}
*/
app.post("/login", (req, res) => {
  if (req.body != undefined) {
    console.dir(req.body);
    //Antes de acceder a cada propiedad se debería comprobar su existencia como con express-validator
    if (req.body.user === undefined || req.body.password === undefined) {
      //No se cumple el formato esperado
      res.status(STATUS_BADFORMAT).end();
    } else if (req.body.user === "user" && req.body.password === "1234") {
      // Autenticación correcta
      res.status(STATUS_OK).end();
    } else {
      // Error en la autenticación
      res.status(STATUS_UNAUTHORIZED).end();
    }
  } else {
    //No se cumple el formato esperado
    res.status(STATUS_BADFORMAT).end();
  }
});

// Último endpoint por defecto por si la petición no está en el API REST - Error 404
app.use((req, res) => {
  res.status(STATUS_NOTFOUND).end();
});

console.log(`[SERVIDOR] Iniciando servidor HTTP sobre Node.js 
           Servicio ${SERVICE_NAME}
           Versión ${VERSION}           
-------------------------------------------------`);

// Este código emplea el módulo dns y el os para buscar la IP del host
dns.lookup(os.hostname(), 4, function (err, address, family) {
  // 4 para IPv4
  if (err) {
    console.error("[SERVIDOR] Error al obtener la IP del servidor.");
  } else {
    console.log("[SERVIDOR] IP del servidor: " + address.toString());
    // Se inicia el servidor HTTP una vez se ha buscado la IP en el puerto prefijado
    app.listen(SERVICE_PORT, address.toString(), (error) => {
      if (error) {
        console.error(`[SERVIDOR] Error al inicializar: ${error}`);
      } else {
        console.log(
          `[SERVIDOR] Servidor ejecutándose en http://${address}:${SERVICE_PORT}`,
        );
      }
    });
  }
});