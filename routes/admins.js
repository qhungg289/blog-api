const router = require("express").Router();
const adminsController = require("../controllers/adminsController");

router.post("/signup", adminsController.signupPost);

router.post("/login", adminsController.loginPost);

module.exports = router;
