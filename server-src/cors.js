import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

/**
 * Update Content Security Policy headers.
 * Will add google to the security headers.
 * @param req
 * @param res
 * @param next
 */
function cors (req, res, next) {
    const csp = extractCSP(res);
    csp[`default-src`] = `'self' 'unsafe-inline' 'unsafe-eval'`;
    csp[`script-src-elem`] = `* 'self' 'unsafe-inline' 'unsafe-eval'`;
    csp[`style-src-elem`] = `* 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='`;
    csp[`font-src`] = `*`;
    csp[`img-src`] = `'self' *`;
    // csp[`style-src`] = `'self' *.google.com 'unsafe-inline'`;
    // csp[`img-src`] = `*`;
    delete csp[`script-src`];
    delete csp[`script-src-attr`];
    res.set(`Content-Security-Policy`, concatCSP(res, csp));
    next();
}

/**
 * Extract Content Security Policy from header.
 * Returns a JS object with each policy as a field-name, and the
 * contents of that policy as the field-value.
 * @param res
 * @returns {JS-Object}
 */
function extractCSP (res) {
    const cspHeader = res.get(`Content-Security-Policy`);
    if (!cspHeader) return {};
    const csp = cspHeader.split(`;`);
    const dict = {};

    for (const policy of csp) {
        const kv = policy.split(/ /);
        dict[kv[0]] = kv[1] ?? ``;
    }

    return dict;
}

/**
 * Prepare Content Security Policy for header.
 * Concatenates the JS-Object returned from #extractCSP into a string.
 * This string can be sent in a response header under "Content-Security-Policy".
 * @param res
 * @param csp
 * @returns {string}
 */
function concatCSP (res, csp) {
    let policyString = ``;
    for (const key in csp) {
        policyString = policyString + key + ` ` + csp[key] + `;`;
    }
    return policyString;
}

export default cors;
