const Router = require("express").Router();
const Controller = require("./controler");

Router.post("/generate", Controller.store);
Router.post("/status", Controller.update);
Router.post("/notification", Controller.notification);
Router.get("/", Controller.get);

module.exports = Router;
