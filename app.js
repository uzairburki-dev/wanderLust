if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

//Imported Packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const path = require('path');
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const app = express();

//App Connection
const port = process.env.PORT || 8080;
app.listen(port, (req, res) => {
    console.log("Server is Working");
});

//Imported Files
const ExpressError = require("./utils/expressError");
const listingsRoutes = require("./Routes/listingsRoutes");
const reviewsRoutes = require("./Routes/reviewsRoutes");
const usersRoutes = require("./Routes/usersRoutes");
const UserModel = require("./models/userModel");

//Connection Variables

const mongodbUrl = process.env.ATLAS_DBURL;
const store = MongoStore.create({
    mongoUrl: mongodbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
}); 
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + 1 * 24 * 60 * 60 * 1000,
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// function to track the store building
store.on("error", (err) => {
    console.log("ERROR_IN_MONGO_SESSION_STORE", err);
})

//essentials
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser())
passport.deserializeUser(UserModel.deserializeUser())

//db Connection-function
async function main() {
    await mongoose.connect(mongodbUrl);
}

//function Call
main().then(() => {
    console.log("Connected Successfully app to db");
}).catch((err) => {
    console.log("error is connection", err);
});

//middleware to get locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//Routes
app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", usersRoutes);
app.get("/terms", (req, res) => {
    res.render("footer/terms.ejs")
});
app.get("/privacy", (req, res) => {
    res.render("footer/privacy.ejs")
});

//Random route Handling
app.use((req, res, next) => {
    next(new ExpressError(404, "Page_Not_Found"));
});

//Error Handling Middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "something went wrong" } = err;
    if (status === 404) {
        res.status(status).render("error/page_not_found.ejs");
    } else {
        res.status(status).render("error/error.ejs", { message });
    }
});

