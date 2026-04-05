if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const path = require('path');
const session = require("express-session");
let MongoStore = require('connect-mongo'); // FIXED
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const app = express();

// 🔥 VERCEL FIX
app.set("trust proxy", 1);

// Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Server is Working");
});

// Routes & Models
const ExpressError = require("./utils/expressError");
const listingsRoutes = require("./Routes/listingsRoutes");
const reviewsRoutes = require("./Routes/reviewsRoutes");
const usersRoutes = require("./Routes/usersRoutes");
const UserModel = require("./models/userModel");

// DB URL
const mongodbUrl = process.env.ATLAS_DBURL;

// 🔥 FIX: handle all connect-mongo versions
if (MongoStore.default) {
    MongoStore = MongoStore.default;
}

// Session Store
const store = MongoStore.create({
    mongoUrl: mongodbUrl,
    crypto: {
        secret: process.env.SECRET || "mysupersecret",
    },
    touchAfter: 24 * 3600,
});

// Session Config
const sessionOptions = {
    store,
    secret: process.env.SECRET || "mysupersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

// Store error
store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

// Middlewares
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);

// Session
app.use(session(sessionOptions));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// DB connect
async function main() {
    try {
        await mongoose.connect(mongodbUrl);
        console.log("✅ DB CONNECTED");
    } catch (err) {
        console.log("❌ DB ERROR:", err);
    }
}

main();

// Locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.get("/", (req, res) => {
    res.redirect("/login");
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

// 404
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