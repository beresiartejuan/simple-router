import http from "http";
import cors from "http-cors";
import router from "../src/index.js";

const port = process.env.PORT || 3000;

// Default: process.cwd()
//router.setPathForViews(path_of_your_views);

// GET http://localhost:3000/
router.get('/', () => {
    return "Hello!";
});

router.get('/', () => {

});

const server = http.createServer((req, res) => {

    if (cors(req, res)) return;

    router.setRequest(req);
    router.setResponse(res);

    router.matchUrl(req.url || '/', req.method);

}).listen(port, () => {

    console.log(`Server running in http://localhost:${port}`);

});