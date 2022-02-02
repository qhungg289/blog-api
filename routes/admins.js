const router = require("express").Router();
const adminsController = require("../controllers/adminsController");

router.post("/signup", adminsController.signUp);

router.post("/login", adminsController.logIn);

module.exports = router;
