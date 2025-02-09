import users from "../../controllers/users";

import { serialize } from "cookie";

export default async function handler(
  req,
  res
) {
  return await users.resetPassword(req).then(data => {
    const maxAge = 1000 * 60 * 60; // 1 hour
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
  }).catch(err => res.status(500).json({ message: err.message }));
}