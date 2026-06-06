const SERVICE_NAME = "volunteers";
const SERVICE_ROOT = "/";

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BADFORMAT = 400;
const STATUS_FORBIDDEN = 403;
const STATUS_NOTFOUND = 404;
const STATUS_SERVER_ERROR = 500;

const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";
const DB_USERS_COLLECTION = "volunteers";

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const vArrow = (req, res, next) => {
  if (req.body !== undefined) {
    next();
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
};

router.post("/", vArrow, function (req, res) {
  const client = new MongoClient(DB_URL); 
  async function run() {
    try {       
      
      const db = client.db(DB_NAME);                          
      const volunteers = db.collection(DB_USERS_COLLECTION);
        
      const found = await volunteers.countDocuments({ user: req.body.user });    
      if (found !== 0) {
        console.log(`[SERVIDOR] El usuario ${req.body.user} ya existe en la base de datos`);
        res.status(STATUS_FORBIDDEN).end();
      } else {
        const result = await volunteers.insertOne(req.body);
        console.log(`[SERVIDOR] Documento insertado con _id: ${result.insertedId}`);
        res.status(STATUS_CREATED).json({ _id: result.insertedId });
      }
    } finally {
      
      await client.close();
    }
  }
  run().catch((ex) => { 
    console.error("[SERVIDOR] POST /volunteers: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});


router.get("/", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME);                          
      const volunteers = db.collection(DB_USERS_COLLECTION);
      let options = new Object(); 
      let filter = new Object();
      req.query.age !== undefined ? filter.age = { $gte: parseInt(req.query.age) } : undefined; 
      req.query.limit !== undefined ? options.limit = parseInt(req.query.limit) : undefined;   
     
      const cursor = await volunteers.find(filter, options);
      const result = await cursor.toArray();
      res.json(result);
    }finally {
      await client.close();
    }
  }
  run().catch((ex) => {
    console.error("[SERVIDOR] GET /volunteers: " + ex.toString());
    res.status(STATUS_SERVER_ERROR).end();
  });
});


router.get("/:id", function (req, res) { 
  const client = new MongoClient(DB_URL); 
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const volunteers = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);  
      const result = await volunteers.findOne({ _id: id });
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




router.put(":id", function (req, res) {
  const client = new MongoClient(DB_URL); 
  async function run() {
    try {
      const db = client.db(DB_NAME);
      const volunteers = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id); 

      
      if (req.body.user !== undefined || req.body._id !== undefined) {
        res.status(STATUS_BADFORMAT).json({ message: "El campo user o _id no se pueden modificar." });
      } else {
        const result = await volunteers.updateOne({ _id: id }, { $set: req.body });
    
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




router.delete(":id", function (req, res) {
  const client = new MongoClient(DB_URL);
  async function run() {
    try {
      const db = client.db(DB_NAME); 
      const volunteers = db.collection(DB_USERS_COLLECTION);
      const id = new ObjectId(req.params.id);
      const result = await volunteers.deleteOne({ _id: id }); 
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