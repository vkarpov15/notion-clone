import EditablePage from "../components/editablePage";
import cookies from "next-cookies";

import { postPage } from "../controllers/pages";

// If a user hits "/", we create a blank page and redirect to that page
// so that each user gets his/her personal space to test things

const IndexPage = ({ pid, blocks, err }) => {
  return <EditablePage id={pid} fetchedBlocks={blocks} err={err} />;
};

export const getServerSideProps = async (context) => {
  const blocks = [{ tag: "p", html: "", imageUrl: "" }];
  const res = context.res;
  const req = context.req;
  const { token } = cookies(context);
  req.cookies = { token };
  req.body = { blocks };

  try {
    const data = await postPage(req);
    const pageId = data.pageId;
    const creator = data.creator;
    const query = !creator ? "?public=true" : ""; // needed to show notice
    res.writeHead(302, { Location: `/p/${pageId}${query}` });
    res.end();
    return { props: {} };
  } catch (err) {
    console.log(err);
    return { props: { blocks: null, pid: null, err: true } };
  }
};

export default IndexPage;
