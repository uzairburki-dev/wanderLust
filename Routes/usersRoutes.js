const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares");
const userController = require("../controller/user");


router.route("/signup")
    .get(userController.signupForm)
    .post(userController.AddUser);


router.route("/login")
    .get(userController.loginForm)
    .post(
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.login
);
    // .post(saveRedirectUrl, passport.authenticate("local", {
    //     failureRedirect: "/login",
    //     failureFlash: true,
    // }), userController.login);

//log Out
router.get("/logout", userController.logout);

module.exports = router;