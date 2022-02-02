const router = require("express").Router();
const adminController = require("../controllers/adminsController");

router.post("/signup", adminController.signupPost);

router.post("/login", adminController.loginPost);

module.exports = router;
