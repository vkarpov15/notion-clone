import EditablePage from "../components/editablePage";
import { useEffect, useState } from "react";

// If a user hits "/", we create a blank page and redirect to that page
// so that each user gets his/her personal space to test things

const IndexPage = () => {
  const [page, setPage] = useState(null);

  useEffect(() => void async function fetchData() {
    const blocks = [{ tag: "p", html: "", imageUrl: "" }];
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/pages`, {
      method: "POST",
      // Forward the authentication cookie to the backend
      headers: {
        "Content-Type": "application/json",
        authorization: window.localStorage.getItem("token") || "",
      },
      body: JSON.stringify({
        blocks: blocks,
      }),
    });
    const data = await response.json();
    setPage(data);
  }(), []);

  if (!page) {
    return <div></div>;
  }

  const query = !page.creator ? "?public=true" : "";
  window.location.href = `/p/${page.pageId}${query}`;

  return <div></div>;
};

export default IndexPage;
