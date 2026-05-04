/*
 * Fase 3 - Desarrollo de la aplicación en el back-end
 * ASIGNATURA: Servicios y Aplicaciones Telemáticas
 * EQUIPO: IngenierosDVJJAC
 * PROYECTO: Comedor Social "Amor y Lentejas"
 */



const express = require("express");
const os = require("node:os");
const dns = require("node:dns");
const { MongoClient, ObjectId } = require("mongodb");

// Datos del servicio
const VERSION = "1.0";
const SERVICE_NAME = "API Amor y Lentejas (IngenierosDVJJAC)";
const SERVICE_PORT = 8081;

// Códigos de estado HTTP
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_NOTFOUND = 404;
const STATUS_SERVER_ERROR = 500;

// Constantes de la base de datos MongoDB
const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas"; 
const DB_USERS_COLLECTION = "users";
const DB_TURNOS_COLLECTION = "turnos"; 


// 2. INICIALIZACIÓN DE EXPRESS Y MIDDLEWARES

const app = new express();

app.use(express.json()); // Permite leer el cuerpo de las peticiones en formato JSON

// Middleware para registrar en consola todas las peticiones entrantes
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante: " + req.method + " " + req.path);
  next();
});


// 3. TAREA 2: SERVICIO BÁSICO DE LOGIN
app.post("/login", (req, res) => {
  if (req.body != undefined) {
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

// Middleware de validación en flecha para usuarios y turnos
const vFlecha = (req, res, next) => {
  if (req.body !== undefined) {
    next();
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
};


// 4. TAREA 4: CRUD COMPLETO DE USUARIOS EN MONGODB


// POST /users - Crear usuario
app.post("/users", vFlecha, function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);
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
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] POST /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

// GET /users - Leer usuarios (con filtros age y limit opcionales)
app.get("/users", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);
      let options = new Object();
      req.query.age !== undefined ? options.age = { $gte: parseInt(req.query.age) } : undefined;
      req.query.limit !== undefined ? options.limit = parseInt(req.query.limit) : undefined;
      
      const cursor = await users.find({}, options);
      const result = await cursor.toArray();
      res.json(result);
    } finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] GET /users: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

// GET /users/:id - Leer un usuario específico
app.get("/users/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);
      const result = await users.findOne({ _id: id });
      if (result) {
        res.json(result);
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
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

// PUT /users/:id - Actualizar usuario
app.put("/users/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);

      if (req.body.user !== undefined || req.body._id !== undefined) {
        res.status(STATUS_BADFORMAT).json({ message: "El campo user o _id no se pueden modificar." });
      } else {
        const result = await users.updateOne({ _id: id }, { $set: req.body });
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

// DELETE /users/:id - Borrar usuario
app.delete("/users/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const users = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);
      const result = await users.deleteOne({ _id: id });
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
app.post("/turnos", vFlecha, function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      
      // Validación manual obligatoria de tus datos
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



// 6. ERROR 404 GENÉRICO Y ARRANQUE DEL SERVIDOR


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