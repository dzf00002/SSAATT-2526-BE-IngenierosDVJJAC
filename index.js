const express = require("express");
const os = require("node:os");
const dns = require("node:dns");
const { MongoClient, ObjectId } = require("mongodb");

const loginRouter = require("./routes/login");
const volunteersRouter = require("./routes/volunteers");

const VERSION = "1.0";
const SERVICE_NAME = "API Amor y Lentejas (IngenierosDVJJAC)";
const SERVICE_PORT = 8091;

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_NOTFOUND = 404;
const STATUS_SERVER_ERROR = 500;

const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";
const DB_USERS_COLLECTION = "volunteers";
const DB_TURNS_COLLECTION = "turns";

const path = require("node:path");
const app = express();
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante: " + req.method + " " + req.path);
  next();
});

const vArrow = (req, res, next) => {
  if (req.body !== undefined) {
    next();
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
};

app.post("/turns", vArrow, function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turns = db.collection(DB_TURNS_COLLECTION);

      if (!req.body.id || !req.body.day || !req.body.food) {
        return res
          .status(STATUS_BADFORMAT)
          .json({ error: "Faltan datos obligatorios (id, day, food)" });
      }

      req.body.state = "reservado";

      const result = await turns.insertOne(req.body);
      console.log(`[SERVIDOR] Turno insertado: ${req.body.id}`);
      res.status(STATUS_CREATED).json({ _id: result.insertedId });
    } finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] POST /turns: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

app.get("/turns", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turns = db.collection(DB_TURNS_COLLECTION);
      const result = await turns.find().toArray();
      res.json(result);
    } finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] GET /turns: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});

app.get("/turns/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turns = db.collection(DB_TURNS_COLLECTION);

      const turnId = req.params.id;
      const result = await turns.findOne({ id: turnId });

      if (result) {
        res.json(result);
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      res.status(STATUS_SERVER_ERROR).end();
    } finally {
      await client.close();
    }
  }
  run().catch(() => res.status(STATUS_SERVER_ERROR).end());
});

app.put("/turns/:id", vArrow, function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turns = db.collection(DB_TURNS_COLLECTION);

      const turnId = req.params.id;

      const result = await turns.updateOne({ id: turnId }, { $set: req.body });

      if (result.matchedCount === 1) {
        console.log("[SERVIDOR] Turno actualizado correctamente: " + turnId);
        res.status(STATUS_OK).end();
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      res.status(STATUS_SERVER_ERROR).end();
    } finally {
      await client.close();
    }
  }
  run().catch(() => res.status(STATUS_SERVER_ERROR).end());
});

app.delete("/turns/:id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const turns = db.collection(DB_TURNS_COLLECTION);

      const turnId = req.params.id;

      const result = await turns.deleteOne({ id: turnId });

      if (result.deletedCount === 1) {
        console.log("[SERVIDOR] Turno anulado correctamente: " + turnId);
        res.status(STATUS_OK).end();
      } else {
        res.status(STATUS_NOTFOUND).end();
      }
    } catch (error) {
      res.status(STATUS_SERVER_ERROR).end();
    } finally {
      await client.close();
    }
  }
  run().catch(() => res.status(STATUS_SERVER_ERROR).end());
});

const API = {
  LOGIN: "/login",
  VOLUNTEERS: "/volunteers"
};

app.use(API.LOGIN, loginRouter);
app.use(API.VOLUNTEERS, volunteersRouter);

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
        console.log(
          `[SERVIDOR] Servidor ejecutándose en http://${address}:${SERVICE_PORT}`
        );
      }
    });
  }
});
