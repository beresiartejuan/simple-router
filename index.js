import http from "http";
import cors from "http-cors";
import routes from "./routes.js";

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

    if (cors(req, res)) return;

    routes.setRequest(req);
    routes.setResponse(res);

    routes.matchUrl(req.url || '/');

    return res.end();

}).listen(port, () => {

    console.log(`Server running in http://localhost:${port}`);

});