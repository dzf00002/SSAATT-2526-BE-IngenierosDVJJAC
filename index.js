

//Importacion de librerias necesarias
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
app.use(express.json());  //Permite que Express pueda leer las peticiones en JSON mediante el objeto (req),empleando la propiedad req.body.
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante: " + req.method + " " + req.path); //Hace que se pase el proceso al siguiente endpoint que coincida
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
app.get("/voluntarios", function (req, res) {
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
app.delete("/voluntarios/:id", function (req, res) {//Definicion del endpoint, elmina un turno específico
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



// 5. TAREA 5: CRUD DE TURNOS




// POST /turnos - Crear un turno en la base de datos
  //Crea u nuevo turno en la base de datos
app.post("/turnos", vFlecha, function (req, res) {
  //vFlecha: Es un middleware que compueba si la petición tiene body json
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

      //Coge todos los datos insertados por el usuario y los actualiza
      const result = await turnos.insertOne(req.body);
      console.log(`[SERVIDOR] Turno insertado con _id: ${result.insertedId}`);
      res.status(STATUS_CREATED).json({ _id: result.insertedId }); //Crea el _id
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
      const db = client.db(DB_NAME);//Seleciona la base
      const turnos = db.collection(DB_TURNOS_COLLECTION);//Selecciona los datos de la tabla de turnos
      const result = await turnos.find().toArray();// find sin filtro para coger todos los datos toArray para que los mande en forma de array
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
app.get("/turnos/:id", function (req, res) {//El :id refleja que cuando alguien se meta a la url turnos, su id sera guardado
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      const id = new ObjectId(req.params.id);//Transforma el id en _id(formato de mongo)
      const result = await turnos.findOne({ _id: id });//findOne:quedate con el primero que encuentres que cumpla con el requisto ()
     
      //Si lo encuenta lo imprime sino imprime un error
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
app.put("/turnos/:id", function (req, res) {//Cuando alguien se meta en turnos se le guarda la id
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);//Selecciona base datos
      const turnos = db.collection(DB_TURNOS_COLLECTION);//Selecciona la parte de los turnos de la base
      const id = new ObjectId(req.params.id);// Coge la id y la pasa a formato _id


      if (req.body._id !== undefined) {
        return res.status(STATUS_BADFORMAT).json({ message: "El campo _id no se puede modificar." });
      }//Comprobación de que el _id esta bien 


      const result = await turnos.updateOne({ _id: id }, { $set: req.body });//Actualiza los datos segun este filtro () con los datos que el usuario manda ($set)
      if (result.matchedCount === 1) {//Si se encuentra el id (con el filtro)
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
app.delete("/turnos/:id", function (req, res) {//Le decimos que elimine segun id en la ruta /turnos
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turnos = db.collection(DB_TURNOS_COLLECTION);
      const id = new ObjectId(req.params.id);// Coge el id del usuario que se le asigna en la url y lo pasa a formato _id
     
      const result = await turnos.deleteOne({ _id: id });// Borra solamente el primer turno que cumpla con el filtro ()
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
app.use((req, res) => {//Express lee todo el codigo, y si la ruta no existe salta el error
  res.status(STATUS_NOTFOUND).end();
});


console.log(`[SERVIDOR] Iniciando servidor HTTP sobre Node.js
           Servicio: ${SERVICE_NAME}
           Versión: ${VERSION}            
-------------------------------------------------`);

//Averiguar tu IP
dns.lookup(os.hostname(), 4, function (err, address, family) {//os.hostname: como se llama tu pc?, dns lookup: coge ese nombre y da dirección IP
  //4 para IPv4
  if (err) {
    console.error("[SERVIDOR] Error al obtener la IP del servidor.");
  } else {
    console.log("[SERVIDOR] IP del servidor: " + address.toString());
    // Se inicia el servidor HTTP una vez se ha buscado la IP en el puerto prefijado
    app.listen(SERVICE_PORT, address.toString(), (error) => {//app.listen: Express empieza a trabajar, puerto 8081, address.ts...la ip que acabamos de averiguar
      if (error) {
        console.error(`[SERVIDOR] Error al inicializar: ${error}`);
      } else {
        console.log(`[SERVIDOR] Servidor ejecutándose en http://${address}:${SERVICE_PORT}`);
      }
    });
  }
});













