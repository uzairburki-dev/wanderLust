const User = require("../models/userModel");
module.exports.signupForm =(req, res) => {
    res.render("user/signup.ejs");
};

module.exports.AddUser = async (req, res, next) => {
    try{
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const userRegistered = await User.register(user, password);
    req.login(userRegistered, (err) => {
        if (err) {
            next(err);
        };
        req.flash("success", "Welcome! We’re glad you’ve joined our platform.");
        res.redirect("/listings");
    })}
    catch(err){
        req.flash("error", err.message);
        next(err);
    }
};

module.exports.loginForm = (req, res) => {
    res.render('user/login.ejs');
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome Back");
    let redirectingUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectingUrl);
};

module.exports.logout = (req, res, next) => {
    if (!req.user) {
        req.flash("error", " Your are already logged Out. Please Log In");
        return res.redirect("/login");
    };
    req.logout((err) => {
        if (err) {
            return next(err);
        };
        req.flash("success", "You are logged Out Now");
        return res.redirect("/listings");
    });
};