const express = require("express");
const os = require("node:os");
const dns = require("node:dns");
const { MongoClient, ObjectId } = require("mongodb");

//Datos del servicio 
const VERSION = "1.0";
const SERVICE_NAME = "API Amor y Lentejas (IngenierosDVJJAC)";
const SERVICE_PORT = 8081;

