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





