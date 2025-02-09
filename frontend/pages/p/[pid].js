import { resetServerContext } from "react-beautiful-dnd";

import EditablePage from "../../components/editablePage/index";

import cookies from "next-cookies";

import { getPage } from "../../controllers/pages";

const Page = ({ pid, blocks, err }) => {
  return <EditablePage id={pid} fetchedBlocks={blocks} err={err} />;
};

export const getServerSideProps = async (context) => {
  resetServerContext(); // needed for drag and drop functionality
  const pageId = context.query.pid;
  const req = context.req;
  const { token } = cookies(context);
  req.cookies = { token };
  try {
    const data = JSON.parse(JSON.stringify(await getPage({ ...req, params: { pageId } })));
    return {
      props: {
        blocks: data.page.blocks,
        pid: pageId,
        err: false
      },
    };
  } catch (err) {
    return { props: { blocks: null, pid: null, err: true } };
  }
};

export default Page;
