import express from "express";
import cors from "cors";
import router from "../src/router.js";

const port = process.env.PORT || 3000;

// Default: process.cwd()
//router.setPathForViews(path_of_your_views);

// GET http://localhost:3000/
router.get('/', () => {
    return "Hello!";
});

router.get('/ping', (req, res) => {
    res.send("Pong with express response!"); // res is a express.response
});

const app = express();

app.use(cors());
app.use(router.express());

app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`)
});