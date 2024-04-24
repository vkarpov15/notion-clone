import { resetServerContext } from "react-beautiful-dnd";
import { useEffect, useState } from "react";

import EditablePage from "../../components/editablePage/index";

const Page = ({ pid }) => {
  const [blocks, setBlocks] = useState(null);

  useEffect(() => void async function fetchData() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/pages/${pid}`,
      {
        method: "GET",
        credentials: "include",
        // Forward the authentication cookie to the backend
        headers: {
          "Content-Type": "application/json",
          authorization: window.localStorage.getItem('token')
        },
      }
    );
    const data = await response.json();
    setBlocks(data.page?.blocks ?? []);
  }(), []);

  if (blocks == null) {
    return <div></div>;
  }

  return <EditablePage id={pid} fetchedBlocks={blocks} />;
};

export const getServerSideProps = async (context) => {
  resetServerContext(); // needed for drag and drop functionality
  const pageId = context.query.pid;
  return {
    props: { pid: pageId },
  };
};

export default Page;
