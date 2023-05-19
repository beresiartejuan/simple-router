import Router from "./router.js";

const router = new Router();

router.view('/', 'prueba.html');

router.get('/ping', () => "Pong!");

router.get('/hello/:name', (req, res) => {

    const { name } = req?.params;

    return `Hello ${name}`;

});

export default router;