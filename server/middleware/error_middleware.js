const errorMiddleware = (err, req, res, next) => {
    // console.log(err);
    const status = err.status || 500;
    const message = err.message || "BACKENED ERROR";
    const extraDetails = err.extraDetails || "Error from backened";
    // console.log("message", message, "extradetails", extraDetails);
    console.log("====================error genereated ================")
    console.log(err);

    return res.status(status).json({ message, extraDetails });
};
module.exports = errorMiddleware;