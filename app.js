if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Imported Packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const path = require('path');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const app = express();

// VERY IMPORTANT FOR VERCEL (fix cookies issue)
app.set("trust proxy", 1);

// Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Server is Working");
});

// Imported Files
const ExpressError = require("./utils/expressError");
const listingsRoutes = require("./Routes/listingsRoutes");
const reviewsRoutes = require("./Routes/reviewsRoutes");
const usersRoutes = require("./Routes/usersRoutes");
const UserModel = require("./models/userModel");

// MongoDB URL
const mongodbUrl = process.env.ATLAS_DBURL;

// Session Store (MongoDB)
const store = MongoStore.create({
    mongoUrl: mongodbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

// Session Config (FIXED)
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, // IMPORTANT FIX
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

// Error in session store
store.on("error", (err) => {
    console.log("ERROR_IN_MONGO_SESSION_STORE", err);
});

// Essentials
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);

// Session middleware
app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// MongoDB connection
async function main() {
    await mongoose.connect(mongodbUrl);
}

main()
    .then(() => console.log("Connected Successfully app to db"))
    .catch((err) => console.log("error in connection", err));

// Locals middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", usersRoutes);

app.get("/terms", (req, res) => {
    res.render("footer/terms.ejs");
});

app.get("/privacy", (req, res) => {
    res.render("footer/privacy.ejs");
});

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;

    if (status === 404) {
        res.status(status).render("error/page_not_found.ejs");
    } else {
        res.status(status).render("error/error.ejs", { message });
    }
});