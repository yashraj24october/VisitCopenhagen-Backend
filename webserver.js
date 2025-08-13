let express = require("express");
let mongoose = require("mongoose");
let MenuApiRoutes = require("./routes/MenuRoutes.js");
require('dotenv').config();
const cors = require('cors');
const { userRoutes } = require("./routes/AuthRoutes.js");
let siteSettingsRoute = require("./routes/SettingsRoute.js");
let path = require("path");

let app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use('/api', MenuApiRoutes);
app.use('/api', userRoutes);
app.use('/api', siteSettingsRoute);

// Request logger (optional, but before routes if you want to log all)
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// Connect DB, then listen
mongoose.connect("mongodb://localhost:27017/visitCopenhagenDB")
    .then(() => {
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log("Backend server connected successfully at Port " + port);
        });
    })
    .catch((error) => {
        console.log("Error while database connection: " + error.message);
    });
