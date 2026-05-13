

/*Importacion de librerias necesarias*/
const express = require("express"); //Permite crear el servidor, en concreto para definir rutas con PUT, GET o DELETE
const os = require("node:os"); //Obtiene información del SO y nombre de la maquina
const dns = require("node:dns"); //Obtiene la IP asociada al nombre del equipo
const { MongoClient, ObjectId } = require("mongodb"); //Permite conectarse a mongo y crear un identificador

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


// Constantes de la base de datos. Define los datos de conexión con Mongo
const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";                //Base de datos usada
const DB_USERS_COLLECTION = "voluntarios";
const DB_TURNOS_COLLECTION = "turnos";

// Express 
const app = new express(); //Crea la aplicacion del servidor
app.use(express.json());  //Permite que Express pueda leer las peticiones en JSON
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante: " + req.method + " " + req.path);
  next();
});  //Muestra cada peticion que llega al servidor


//Endpoint post/login
app.post("/login", (req, res) => {

  // Comprueba que la petición incluye un cuerpo JSON
  if (req.body != undefined) { //Comprueba si la petición tiene cuerpo
    if (req.body.user === undefined || req.body.password === undefined)
    {
      res.status(STATUS_BADFORMAT).end(); //Si falta user o password devuelve error 400
    } 
    else if (req.body.user === "user" && req.body.password === "1234") 
    {
      res.status(STATUS_OK).end(); //Si son correctas devuelve 200
    } 
    else
    {
        res.status(STATUS_UNAUTHORIZED).end(); //Si no coinciden devuelve 401
    }
  } 
  else
  {
    res.status(STATUS_BADFORMAT).end(); //Devuelve 400 si no tiene cuerpo
  }

});//User:user y password:1234



// Funcion para comprobar que el cliente ha enviado datos
const vFlecha = (req, res, next) => {
  if (req.body !== undefined) 
  {
    next();
  } 
  else 
  {
    res.status(STATUS_BADFORMAT).end();
  }
};




 //TAREA 4. CRUD COMPLETO 
 // POST /voluntarios - Crear usuario
app.post("/voluntarios", vFlecha, function (req, res) {
  const client = new MongoClient(DB_URL); //Se crea un cliente para conectarse a Mongo
  async function run() {
    try {
      //crea cliente
      const db = client.db(DB_NAME);                          //Seleccion de base de datos y colección
      const voluntarios = db.collection(DB_USERS_COLLECTION);
        // Busca si ya existe un usuario con el mismo nombre de usuario
      const buscado = await voluntarios.countDocuments({ user: req.body.user });
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
app.get("/voluntarios", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);                          //Selecciona la base y la colección
      const voluntarios = db.collection(DB_USERS_COLLECTION);
      let options = new Object(); //Crea un objeto vacío para guardar opciones
      req.query.age !== undefined ? options.age = { $gte: parseInt(req.query.age) } : undefined; //Filtra usuarios entre un rango de edad
      req.query.limit !== undefined ? options.limit = parseInt(req.query.limit) : undefined;     //Limita cuantos usuarios se muestran segun el valor de limit
     
      const cursor = await voluntarios.find({}, options);
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
app.get("/voluntarios/:id", function (req, res) { //Permite localizar a un usuario por su id
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
app.put("/voluntarios/:id", function (req, res) {
  const client = new MongoClient(DB_URL); //Convierte URL en objeto
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const voluntarios = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);


      if (req.body.user !== undefined || req.body._id !== undefined) {
        res.status(STATUS_BADFORMAT).json({ message: "El campo user o _id no se pueden modificar." });
      } else {
        const result = await voluntarios.updateOne({ _id: id }, { $set: req.body });
        if (result.matchedCount === 1) {
          res.status(STATUS_OK).end();
        } else {
          res.status(STATUS_NOTFOUND).end();
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
app.delete("/voluntarios/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const voluntarios = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);
      const result = await voluntarios.deleteOne({ _id: id });
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



// 5. TAREA 5: CRUD DE TURNOS




// POST /turnos - Crear un turno en la base de datos
  //Crea u nuevo turno en la base de datos
app.post("/turnos", vFlecha, function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
       //Obtenemos la referencia de la base de datos y obtenemos la colección de turnos
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
     
      // Validación obligatoria  de datos
      if (!req.body.nombre || !req.body.dia || !req.body.grupo) {
        return res.status(STATUS_BADFORMAT).json({ error: "Faltan datos obligatorios (nombre, dia, grupo)" });
      }


      const result = await turnos.insertOne(req.body);
      console.log(`[SERVIDOR] Turno insertado con _id: ${result.insertedId}`);
      res.status(STATUS_CREATED).json({ _id: result.insertedId });
    } finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] POST /turnos: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});



// GET /turnos - Leer todos los turnos de la base de datos
app.get("/turnos", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      const result = await turnos.find().toArray();
      res.json(result);
    } finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] GET /turnos: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});
// GET /turnos/:id - Leer un turno concreto de la base de datos
app.get("/turnos/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      const id = new ObjectId(req.params.id);
      const result = await turnos.findOne({ _id: id });
     
      if (result) {
        res.json(result);
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



// PUT /turnos/:id - Modificar un turno existente en la base de datos
app.put("/turnos/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      const id = new ObjectId(req.params.id);


      if (req.body._id !== undefined) {
        return res.status(STATUS_BADFORMAT).json({ message: "El campo _id no se puede modificar." });
      }


      const result = await turnos.updateOne({ _id: id }, { $set: req.body });
      if (result.matchedCount === 1) {
        console.log("[SERVIDOR] Turno actualizado correctamente.");
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

// DELETE /turnos/:id - Borrar un turno de la base de datos
app.delete("/turnos/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      const id = new ObjectId(req.params.id);
     
      const result = await turnos.deleteOne({ _id: id });
      if (result.deletedCount === 1) {
        console.log("[SERVIDOR] Turno eliminado correctamente.");
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






//ERROR 404 Y ARRANQUE DEL SERVIDOR




// Endpoint final por si la ruta no existe
app.use((req, res) => {
  res.status(STATUS_NOTFOUND).end();
});


console.log(`[SERVIDOR] Iniciando servidor HTTP sobre Node.js
           Servicio: ${SERVICE_NAME}
           Versión: ${VERSION}            
-------------------------------------------------`);


dns.lookup(os.hostname(), 4, function (err, address, family) {
  if (err) {
    console.error("[SERVIDOR] Error al obtener la IP del servidor.");
  } else {
    console.log("[SERVIDOR] IP del servidor: " + address.toString());
    app.listen(SERVICE_PORT, address.toString(), (error) => {
      if (error) {
        console.error(`[SERVIDOR] Error al inicializar: ${error}`);
      } else {
        console.log(`[SERVIDOR] Servidor ejecutándose en http://${address}:${SERVICE_PORT}`);
      }
    });
  }
});













