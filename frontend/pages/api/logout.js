import users from "../../controllers/users";

import { serialize } from "cookie";

export default async function handler(
  req,
  res
) {
  return await users.logout(req).then(data => {
    // Clear cookie this way because Next.js doesn't have `res.clearCookie()`
    res.status(201).setHeader(
      'Set-Cookie',
      serialize(
        "token",
        "",
        {
          httpOnly: true,
          expires: new Date(0),
          domain: process.env.DOMAIN,
          path: '/',
        }
      )
    );
    res.json(data);
  }).catch(err => res.status(500).json({ message: err.message }));
}