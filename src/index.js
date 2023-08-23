import path from "path";
import { readFileSync } from "fs";
import { match } from "path-to-regexp";
import { fileURLToPath } from "url";

export default new class router {

    GET_METHOD = "GET";
    POST_METHOD = "POST";
    all_routes = {};
    request = {};
    response = {};
    path_for_views = process.cwd();
    can_show_404_page = true;
    has_error = false;

    constructor() {
        this.all_routes[this.GET_METHOD] = [];
        this.all_routes[this.POST_METHOD] = [];
    }

    /**
     * @name setPathForViews
     * @description Declare a path for all views used on this router
     * @param {string} absolute_path 
     */
    setPathForViews(absolute_path) {
        this.path_for_views = absolute_path;
    }

    /**
     * @name setRequest
     * @description Set a RequestObject
     * @param {object} request 
     */
    setRequest(request) {
        this.request = request;
    }

    /**
     * @name getRequest
     * @description Return a Request Object if you was set one
     * @param {function | object} fn A funcion with one param(The response object)
     * @returns {object} A ResponseObject
     */
    getRequest(fn = () => { }) {
        if (typeof fn === "function") fn(this.request);
        if (typeof fn === "object") this.request.extra = fn;
        return this.request;
    }

    /**
     * @name setResponse
     * @description Set a ResponseObject
     * @param {object} response
     * @param {boolean} add_methods Do you want the router to add different methods to the ResponseObject?
     */
    setResponse(response, add_methods = true) {

        this.response = response;

        if (!add_methods) return;

        this.response.text = (chuck) => {
            this.response.write(chuck);
        };

        this.response.html = (file) => {
            const absolute_path = path.join(this.path_for_views, file);
            const html_source = readFileSync(absolute_path, { encoding: "utf-8" });
            this.response.write(html_source);
        };
    }

    /**
     * @name getResponse
     * @description Return a Response Object if you was set one
     * @param {function | object} fn A funcion with one param(The response object)
     * @returns {object} A ResponseObject
     */
    getResponse(fn = () => { }) {
        if (typeof fn === "function") fn(this.response);
        if (typeof fn === "object") this.response.extra = fn;
        return this.response;
    }

    get(route, controller) {

        this.all_routes[this.GET_METHOD].push({
            route, controller
        });

    }

    post(route, controller) {

        this.all_routes[this.POST_METHOD].push({
            route, controller
        });

    }

    view(route, path_file) {

        const controller = (req, res) => res.html(path_file);
        this.all_routes[this.GET_METHOD].push({
            route, controller
        });

    }

    show404() {

        if (!this.can_show_404_page) {
            console.log("[simple-router]: Not found!");
            return;
        }

        const old_path_for_views = this.path_for_views;
        this.path_for_views = path.dirname(fileURLToPath(import.meta.url));
        this.getResponse().html('404.html');
        this.has_error = true;
        this.path_for_views = old_path_for_views;

    }

    express({ show_page_not_found, extends_response } = { show_page_not_found: false, extends_response: false }) {

        this.can_show_404_page = show_page_not_found;

        return (req, res, next) => {

            this.setRequest(req);
            this.setResponse(res, extends_response);

            this.matchUrl(req.url, req.method);

            if (this.can_show_404_page && this.has_error) return;

            next();

        }

    }

    matchUrl(url, method) {

        const normalizedMethod = method?.toUpperCase().trim() || this.GET_METHOD;

        if (!Object.keys(this.all_routes).includes(normalizedMethod)) return this.show404();

        let url_already_matched = false;

        this.all_routes[normalizedMethod].forEach(route => {

            if (url_already_matched) return;

            const matcher = match(route.route, { decode: decodeURIComponent });
            const matched = matcher(url);

            if (!matched) return;

            const result = route.controller(
                this.getRequest({
                    params: matched.params,
                    path: matched.path,
                    url,
                    method: normalizedMethod
                }),
                this.getResponse()
            );

            if (typeof result === "string") this.getResponse().write(result);
            if (typeof result === "undefined" || result === null) return;

            url_already_matched = true;

        });

        if (!url_already_matched) this.show404();

        if (!this.getResponse().writableEnded) this.getResponse().end();

    }

};