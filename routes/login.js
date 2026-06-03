//1.2
// Importación de Express y creación del router
const express = require("express");
const router = express.Router();
// Importamos el cliente de MongoDB para poder buscar en la base de datos
const { MongoClient } = require("mongodb");

// Datos del servicio
const SERVICE_NAME = "login";
const SERVICE_ROOT = "/";

// Definición de códigos de estado
const STATUS_OK = 200;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_SERVER_ERROR = 500;

// Constantes de conexión a la base de datos
const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";
const DB_USERS_COLLECTION = "voluntarios";

// Endpoint de autenticación de usuarios POST /login
router.post(SERVICE_ROOT, async (req, res) => {
  // Comprobamos que nos envían datos y que vienen el usuario y la password
  if (req.body != undefined && req.body.user != undefined && req.body.password != undefined) {
    
    const client = new MongoClient(DB_URL);
    
    try {
      // 1. Conectamos a la base de datos y a la colección
      const db = client.db(DB_NAME);
      const voluntarios = db.collection(DB_USERS_COLLECTION);
      
      // 2. Buscamos si existe un documento que tenga exactamente ese correo y esa clave
      const usuarioEncontrado = await voluntarios.findOne({ 
        user: req.body.user, 
        password: req.body.password 
      });

      // 3. Si encontramos al usuario en MongoDB, le dejamos pasar
      if (usuarioEncontrado) {
        console.log("[" + SERVICE_NAME + "] Usuario autenticado correctamente: " + req.body.user);
        res.status(STATUS_OK).end();
      } else {
        // Si no existe o la clave está mal
        console.log("[" + SERVICE_NAME + "] Intento de acceso fallido para: " + req.body.user);
        res.status(STATUS_UNAUTHORIZED).end();
      }
      
    } catch (error) {
      console.error("[" + SERVICE_NAME + "] Error interno de base de datos: " + error.toString());
      res.status(STATUS_SERVER_ERROR).end();
    } finally {
      // Cerramos la conexión con MongoDB
      await client.close();
    }

  } else {
    // Si falta el correo o la contraseña en la petición
    res.status(STATUS_BADFORMAT).end();
  }
});

module.exports = router;
