import path from "path";
import { readFileSync } from "fs";
import { match } from "path-to-regexp";

export default class Router {

    all_routes = [];
    request = null;
    response = null;

    constructor() {
    }

    setRequest(request) {
        this.request = request;
    }

    setResponse(response) {
        this.response = response;
    }

    get(route, controller) {

        this.all_routes.push({
            route, controller
        });

    }

    view(route, path_file) {

        const controller = (req, res) => res.html(path_file);
        this.all_routes.push({
            route, controller
        });

    }

    matchUrl(url) {

        const self = this;

        this.all_routes.forEach(route => {

            const matcher = match(route.route, { decode: decodeURIComponent });
            const matched = matcher(url);

            if (!matched) return;

            const my_request = {
                ...self.request, ...matched
            }

            const my_response = {
                ...self.response,
                text: function (chuck) {
                    self.response.write(chuck);
                },
                html: function (file) {
                    const absolute_path = path.join(process.cwd(), file);
                    const html_source = readFileSync(absolute_path, { encoding: "utf-8" });

                    self.response.write(html_source);
                }
            }

            const result = route.controller(my_request, my_response);

            if (typeof result === "string") self.response.write(result);
            if (typeof result === "undefined" || result === null) return;

        });

    }

}