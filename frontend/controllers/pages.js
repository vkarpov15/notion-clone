const { isAuth } = require("./auth");

const Page = require("../models/page");
const User = require("../models/user");

const getPages = async (req) => {
  isAuth(req);
  const userId = req.userId;

  try {
    if (!userId) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("Could not find user by id.");
      err.statusCode = 404;
      throw err;
    }

    return {
      message: "Fetched pages successfully.",
      pages: user.pages.map((page) => page.toString()),
    };
  } catch (err) {
    throw err;
  }
};

const getPage = async (req) => {
  isAuth(req);
  const userId = req.userId;
  const pageId = req.params.pageId;

  try {
    const page = await Page.findById(pageId);
    if (!page) {
      const err = new Error("Could not find page by id.");
      err.statusCode = 404;
      throw err;
    }

    // Public pages have no creator, they can be accessed by anybody
    // For private pages, creator and logged-in user have to be the same
    const creatorId = page.creator ? page.creator.toString() : null;
    if ((creatorId && creatorId === userId) || !creatorId) {
      return {
        message: "Fetched page successfully.",
        page: page,
      };
    } else {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    throw err;
  }
};

const postPage = async (req) => {
  isAuth(req);
  const userId = req.userId;
  const blocks = req.body.blocks;
  const page = new Page({
    blocks: blocks,
    creator: userId || null,
  });
  try {
    const savedPage = await page.save();

    // Update user collection too
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        const err = new Error("Could not find user by id.");
        err.statusCode = 404;
        throw err;
      }
      user.pages = [...user.pages, savedPage._id];
      await user.save();
    }

    return {
      message: "Created page successfully.",
      pageId: savedPage._id.toString(),
      blocks: blocks,
      creator: userId || null,
    };
  } catch (err) {
    throw err;
  }
};

const putPage = async (req) => {
  isAuth(req);
  const userId = req.userId;
  const pageId = req.query.pageId;
  const blocks = req.body.blocks;

  try {
    const page = await Page.findById(pageId);

    if (!page) {
      const err = new Error("Could not find page by id.");
      err.statusCode = 404;
      throw err;
    }

    // Public pages have no creator, they can be updated by anybody
    // For private pages, creator and logged-in user have to be the same
    const creatorId = page.creator ? page.creator.toString() : null;
    if ((creatorId && creatorId === userId) || !creatorId) {
      page.blocks = blocks;
      const savedPage = await page.save();
      return {
        message: "Updated page successfully.",
        page: savedPage,
      };
    } else {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    throw err;
  }
};

const deletePage = async (req) => {
  isAuth(req);
  const userId = req.userId;
  const pageId = req.query.pageId;

  try {
    const page = await Page.findById(pageId);

    if (!page) {
      const err = new Error("Could not find page by id.");
      err.statusCode = 404;
      throw err;
    }

    // Public pages have no creator, they can be deleted by anybody
    // For private pages, creator and logged-in user have to be the same
    const creatorId = page.creator ? page.creator.toString() : null;
    if ((creatorId && creatorId === userId) || !creatorId) {
      const deletedPage = await Page.findByIdAndDelete(pageId);

      // Update user collection too
      if (creatorId) {
        const user = await User.findById(userId);
        if (!user) {
          const err = new Error("Could not find user by id.");
          err.statusCode = 404;
          throw err;
        }
        user.pages.splice(user.pages.indexOf(deletedPage._id), 1);
        await user.save();
      }

      return {
        message: "Deleted page successfully.",
      };
    } else {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    throw err;
  }
};

exports.getPages = getPages;
exports.getPage = getPage;
exports.postPage = postPage;
exports.putPage = putPage;
exports.deletePage = deletePage;
