import users from "../../controllers/users";

import { serialize } from "cookie";

export default async function handler(
  req,
  res
) {
  return await users.signup(req).then(data => {
    // Set cookie in the browser to store authentication state
    res.status(201).setHeader(
      'Set-Cookie',
      serialize(
        "token",
        data.token,
        {
          httpOnly: true,
          maxAge: maxAge,
          domain: process.env.DOMAIN,
          path: '/',
        }
      )
    ).json(data);
  });
}