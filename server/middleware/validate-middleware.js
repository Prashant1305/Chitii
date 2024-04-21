// Zod
const validate = (schema) => async (req, res, next) => {
    try {
        const pasrseBody = await schema.parseAsync(req.body);
        // console.log(pasrseBody);

        // req.body = pasrseBody;
        // console.log("validated succesfully");
        next();
    } catch (err) {

        const status = 422;
        const message = "Fill the input properly";
        const extraDetails = err.errors[0].message;
        console.log(err);
        const error = {
            status,
            message,
            extraDetails
        };

        // res.status(400).json({ msg: "validation  failed !", error });
        next(error);
    }
};
module.exports = validate;