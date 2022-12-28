const throwError = (message = '', status = 500) => {
    const error = Error(message);
    error.status = status;
    throw error;
}


module.exports = throwError;