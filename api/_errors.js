class HttpError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

const throwHttpError = (message, statusCode) => {
    throw new HttpError(message, statusCode);
}

module.exports = { HttpError, throwHttpError };
