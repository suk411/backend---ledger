import userModel from "../models/user.model";

//user register controller
// post /api/auth/register
function userRegisterController(req, res) {
  const { mobile, password } = req.body;
}

export default { userRegisterController };
