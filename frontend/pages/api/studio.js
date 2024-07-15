import "../../models/mongoose";
import "../../models/page";
import "../../models/rateLimit";
import "../../models/user";

import studio from '@mongoosejs/studio/backend/next';

export default async function handler(
    req,
    res
  ) {
  return await studio()(req).then(result => res.json(result));
}