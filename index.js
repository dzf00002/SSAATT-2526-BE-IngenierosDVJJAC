const express = require("express");
const os = require("node:os");
const dns = require("node:dns");
const { MongoClient, ObjectId } = require("mongodb");

//Datos del servicio 
const VERSION = "1.0";
const SERVICE_NAME = "API Amor y Lentejas (IngenierosDVJJAC)";
const SERVICE_PORT = 8081;

//Códigos estado HTTP
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_NOTFOUND = 404;
const STATUS_SERVER_ERROR = 500;


// Constantes de la base de datos
const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";
const DB_USERS_COLLECTION = "voluntario";
const DB_TURNOS_COLLECTION = "turnos";

// Express 
const app = new express();
app.use(express.json()); 
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante: " + req.method + " " + req.path);
  next();
});

//Endpoint post/login
app.post("/login", (req, res) => {

  // Comprueba que la petición incluye un cuerpo JSON
  if (req.body != undefined) {

    //Comprueba si están los campos obligatorios, que son el usuario y la contraseña y comprueban si coinciden
    if (req.body.user === undefined || req.body.password === undefined) {
      res.status(STATUS_BADFORMAT).end();
    } else if (req.body.user === "user" && req.body.password === "1234") {
      res.status(STATUS_OK).end();
    } else {
      res.status(STATUS_UNAUTHORIZED).end();
    }
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
});
//User:user y password:1234

// Funcion para comprobar que el cliente ha enviado datos
const vFlecha = (req, res, next) => {
  if (req.body !== undefined) {
    next();
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
};


 //TAREA 4. CRUD COMPLETO 
 // POST /users - Crear usuario
app.post("/users", vFlecha, function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      //crea cliente
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);
        // Busca si ya existe un usuario con el mismo nombre de usuario
      const buscado = await users.countDocuments({ user: req.body.user });
      if (buscado !== 0) {
        console.log(`[SERVIDOR] El usuario ${req.body.user} ya existe en la base de datos`);
        res.status(STATUS_FORBIDDEN).end();
      } else {
        const result = await users.insertOne(req.body);
        console.log(`[SERVIDOR] Documento insertado con _id: ${result.insertedId}`);
        res.status(STATUS_CREATED).json({ _id: result.insertedId });
      }
    } finally {
      //cierra conexión mongo
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] POST /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});






