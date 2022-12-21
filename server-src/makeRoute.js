import express from "express";
import handleError from "./handleError.js";
import handleResponse from "./handleResponse.js";

/**
 * Two functions to standardize the api-endpoint json response.
 * The callback-function (CB) returns an object that will be appended
 * to the http json response body.
 * 
 * The CB accepts the request (req) object from the express middleware.
 * This can be used to extract parameters.
 * 
 * If the object returned by cb has a status or a route field, it 
 * will overwrite the default fields.  This should be avoided.
 */

/**
 * Create and return a new express router object.  The response, when 
 * no exception is thrown, will have the result of 'cb' appended to it.
 * Use this function if the router only runs one function.
 * @param {string/router} url Local url of endpoint.
 * @param {function} cb Data object generator.
 * @returns the express router object
 */
function makeRoute(url, cb = async req => { }, route = express.Router()) {
    route.use(
        url,
        routeFactory(url, cb)
    );
    return route;
}

/**
 * Use this function if the route has more than one operation.
 * Pass the result of the this fuction to route.use.
 */
function routeFactory(url, cb) {
    return async (req, res, next) => {
        try {
            handleResponse(res, url, await cb(req));
        } catch (error) {
            handleError(error, url, req, res);
        } finally {
            res.end();
        }
    }
}

export { makeRoute as default, routeFactory };