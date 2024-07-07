const errorMiddleware = (err, req, res, next) => {
    // console.log(err);
    if (err.code === 11000) {
        const error = Object.keys(err.keyPattern).join(",")
        err.message = `Duplicate field - ${error} `;
        err.status = 400;
    }
    const status = err.status || 500;
    const message = err.message || "BACKENED ERROR";
    const extraDetails = err.extraDetails || "Error from backened";
    // console.log("message", message, "extradetails", extraDetails);
    console.log("====================error genereated ================")
    console.log(err);

    return res.status(status).json({ message, extraDetails });
};
module.exports = errorMiddleware;