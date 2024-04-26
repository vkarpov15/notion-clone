import pages from "../../controllers/pages";

export default async function handler(
  req,
  res
) {
  return await pages.getPages(req, res);
}