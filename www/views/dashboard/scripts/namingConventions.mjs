// Convert strings to a specfied delimited format.
// Pascal-case, camel-case and strings  that are delimited with underscore '_', dash '-', 
// or space ' ' are converted to a string delimeted with a specified delimiter.
function convertDelimited(string, delimiter = `-`) {
    string = string.trim();
    string = string.charAt(0).toLocaleLowerCase() + string.substr(1); // leading lower case
    string = string.replace(/[_ -]+/g, delimiter); // replace common delimeters with declared delimiter

    const r1 = RegExp(`[${delimiter}]([A-Z]+)`, `g`);
    string = string.replace(r1, `$1`); // normalize delimiter-capital to capital
    string = string.replace(/([A-Z]+)/g, `${delimiter}$1`).toLowerCase(); // change all upper to lower-delimiter

    const r2 = RegExp(`^[${delimiter}]+`);
    string = string.replace(r2, ``); // remove leading delimiters

    return string;
}

// Convert strings to camel-case format.
// Pascal-case, camel-case and strings  that are delimited with underscore '_', dash '-', 
// or space ' ' are converted to camel-case.
function convertToCamel (string) {
    string = convertDelimited(string, `-`);
    string = string.replace(/(-[a-z])+/g, v => v.toUpperCase()); // replace dash with nothing, letter preceeding to uppercase
    string = string.replace(/-+/g, ``); // remove dashes
    string = string.charAt(0).toLowerCase() + string.substr(1);
    return string;
}

export { convertDelimited, convertToCamel };