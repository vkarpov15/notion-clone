import users from "../../controllers/users";

export default async function handler(
  req,
  res
) {
  return await users.login(req, res);
}