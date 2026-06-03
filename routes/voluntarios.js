const SERVICE_NAME = "voluntarios";
const SERVICE_ROOT = "/";

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_FORBIDDEN = 403;
const STATUS_NOTFOUND = 404;
const STATUS_SERVER_ERROR = 500;

const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";
const DB_USERS_COLLECTION = "voluntarios";

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const vFlecha = (req, res, next) => {
  if (req.body !== undefined) {
    next();
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
};
// POST /voluntarios - Crear usuario
//Consiste en trasladar aquí la parte de gestión de voluntarios añadiendo router
router.post("/", vFlecha, function (req, res) {
  const client = new MongoClient(DB_URL); //Se crea un cliente para conectarse a Mongo
  async function run() {
    try {       //try ejecuta este fragmento de codigo, si falla salta el error propuesto en el catch
      //crea cliente
      const db = client.db(DB_NAME);                          //Seleccion de base de datos y colección
      const voluntarios = db.collection(DB_USERS_COLLECTION);
        // Busca si ya existe un usuario con el mismo nombre de usuario
      const buscado = await voluntarios.countDocuments({ user: req.body.user });    //await hace que no lea la siguiente linea de codigo hasta que mongo no de respuesta
      if (buscado !== 0) {
        console.log(`[SERVIDOR] El usuario ${req.body.user} ya existe en la base de datos`);
        res.status(STATUS_FORBIDDEN).end();
      } else {
        const result = await voluntarios.insertOne(req.body);
        console.log(`[SERVIDOR] Documento insertado con _id: ${result.insertedId}`);
        res.status(STATUS_CREATED).json({ _id: result.insertedId });
      }
    } finally {
      //cierra conexión mongo, se ejecuta siempre
      await client.close();
    }
  }
  run().catch((ex) => { //Si ocurre un error inesperado lo muestra por pantalla
    console.error("[SERVIDOR] POST /voluntarios: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

// GET /voluntarios - Leer todos los usuarios
router.get("/", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);                          //Selecciona la base y la colección
      const voluntarios = db.collection(DB_USERS_COLLECTION);
      let options = new Object(); //Crea un objeto vacío para guardar opciones
      let filtro = new Object();
      req.query.age !== undefined ? filtro.age = { $gte: parseInt(req.query.age) } : undefined; //Filtra usuarios entre un rango de edad
      req.query.limit !== undefined ? options.limit = parseInt(req.query.limit) : undefined;     //Limita cuantos usuarios se muestran segun el valor de limit
     
      const cursor = await voluntarios.find(filtro, options);
      const result = await cursor.toArray();
      res.json(result);
    }finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] GET /voluntarios: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

// GET /voluntarios/:id - Leer un usuario específico
router.get("/:id", function (req, res) { //Permite localizar a un usuario por su id
  const client = new MongoClient(DB_URL); 
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const voluntarios = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);  //Guarda el usuario que viene en la URL
      const result = await voluntarios.findOne({ _id: id });
      if (result) {
        res.json(result);
      } else {
        res.status(STATUS_NOTFOUND).end();   //Si no existe devuelve error 404
      }
    } catch (error) {  //si no tiene un formato valido lanza un error
      if (error instanceof Error && error.name === "BSONError") {
        res.status(STATUS_BADFORMAT).json({ message: "Formato de id inválido" });
      } else {
        res.status(STATUS_SERVER_ERROR).json({ message: "Error del servidor" });
      }
    } finally {
      await client.close();
    }
  }
  run().catch(() => res.status(STATUS_SERVER_ERROR).end());
});



// PUT /voluntarios/:id - Modifica usuario
router.put(":id", function (req, res) {
  const client = new MongoClient(DB_URL); //Convierte URL en objeto
  async function run() {
    try {
      const db = client.db(DB_NAME);// Selecciona la base de datos 
      const voluntarios = db.collection(DB_USERS_COLLECTION);//Selecciona la coleccion de "users" de la base de datos
      const id = new ObjectId(req.params.id); //Convierte la id en una _id que genera mongo

      //Comprobación de que el cliente es quien hace la peticion, no se puede cambiar el id
      if (req.body.user !== undefined || req.body._id !== undefined) {
        res.status(STATUS_BADFORMAT).json({ message: "El campo user o _id no se pueden modificar." });
      } else {
        const result = await voluntarios.updateOne({ _id: id }, { $set: req.body });
        //Si se cumple la validación anterior se cambia el campo que el usuario pedia
        if (result.matchedCount === 1) {
          res.status(STATUS_OK).end();
          //id encontrado
        } else {
          res.status(STATUS_NOTFOUND).end();
          //id no encontrado
        }
      }
    } catch (error) {
      res.status(error.name === "BSONError" ? STATUS_BADFORMAT : STATUS_SERVER_ERROR).end();
    } finally {
      await client.close();
    }
  }
  run().catch(() => res.status(STATUS_SERVER_ERROR).end());
});



// DELETE /voluntarios/:id - Borrar voluntarios
router.delete(":id", function (req, res) {//Definicion del endpoint, elmina un turno específico
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME); //Selecciona la base de datos
      const voluntarios = db.collection(DB_USERS_COLLECTION);// Selecciona los "users" registrados en la base
      const id = new ObjectId(req.params.id);//Convierte la id en _id que genera mongo
      const result = await voluntarios.deleteOne({ _id: id }); // Borra turno que coincida id con el_id que genera mongo
      if (result.deletedCount === 1) {
        res.status(STATUS_OK).end();
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      res.status(error.name === "BSONError" ? STATUS_BADFORMAT : STATUS_SERVER_ERROR).end();
    } finally {
      await client.close();
    }
  }
  run().catch(() => res.status(STATUS_SERVER_ERROR).end());
});
module.exports = router;