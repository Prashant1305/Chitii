// Zod
const validate = (schema) => async (req, res, next) => {
    try {
        const pasrseBody = await schema.parseAsync(req.body);
        // console.log(pasrseBody);

        // req.body = pasrseBody;
        // console.log("validated succesfully");
        next();
    } catch (err) {
        const error = {
            status: 400,
            message: "Fill the input properly",
            extraDetails: err.errors[0].message
        };
        next(error);
    }
};
module.exports = validate;