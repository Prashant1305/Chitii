// Zod
const { ZodError } = require('zod');
const validate = (schema) => async (req, res, next) => {
    try {
        const pasrseBody = await schema.parseAsync(req.body);
        // console.log(pasrseBody);

        // req.body = pasrseBody;
        // console.log("validated succesfully");
        next();
    } catch (err) {
        let message = "", extraDetails = "";
        if (err instanceof ZodError) {
            const errorMessages = err.errors.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));

            errorMessages.forEach((temp) => {
                message += temp.message + ", ";
                extraDetails += temp.path + " => " + temp.message + ", ";
            });
        }

        const error = {
            status: 400,
            message: message !== "" ? message : "Fill input properly",
            extraDetails: extraDetails !== "" ? extraDetails : "from Zod validate"
        };
        next(error);
    }
};
module.exports = validate;