const express = require("express");
const user = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", user.signup);

module.exports = router;
