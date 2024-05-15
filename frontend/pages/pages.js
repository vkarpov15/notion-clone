import { useState } from "react";
import cookies from "next-cookies";

import Card from "../components/card";
import Button from "../components/button";
import Notice from "../components/notice";

import { getPages, getPage } from "../controllers/pages";

const PagesPage = ({ pages }) => {
  const initialPages = pages || [];
  const [cards, setCards] = useState(initialPages);

  const deleteCard = async (pageId) => {
    try {
      await fetch(`/api/delete-page?pageId=${encodeURIComponent(pageId)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const cardIndex = cards.map((page) => page._id).indexOf(pageId);
      const updatedCards = [...cards];
      updatedCards.splice(cardIndex, 1);
      setCards(updatedCards);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1 className="pageHeading">Pages</h1>
      <div id="pageList">
        {cards.length === 0 && (
          <Notice style={{ marginBottom: "2rem" }}>
            <h3>Let's go!</h3>
            <p>Seems like you haven't created any pages so far.</p>
            <p>How about starting now?</p>
          </Notice>
        )}
        {cards.map((page, key) => {
          const updatedAtDate = new Date(Date.parse(page.updatedAt));
          const pageId = page._id;
          const blocks = page.blocks;
          return (
            <Card
              key={key}
              pageId={pageId}
              date={updatedAtDate}
              content={blocks}
              deleteCard={(pageId) => deleteCard(pageId)}
            />
          );
        })}
      </div>
      <Button href="/">Create A New Page</Button>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { token } = cookies(context);
  const res = context.res;
  const req = context.req;

  if (!token) {
    res.writeHead(302, { Location: `/login` });
    res.end();
  }

  req.cookies = { token };

  try {
    const pagesIdList = await getPages(req).then(res => res.pages);
    const pages = await Promise.all(
      pagesIdList.map(async (pageId) => {
        const page = await getPage({ ...req, params: { pageId } }).then(res => res.page).catch(() => null);
        return page;
      })
    );
    const filteredPages = pages
      .filter((page) => page != null)
      .filter((page) => !page.errCode)
      // Need to do this because Next.js can't serialize ObjectIds, Dates
      .map(page => JSON.parse(JSON.stringify(page)));

    return { props: { pages: filteredPages } };
  } catch (err) {
    console.log(err);
    return { props: {} };
  }
};

export default PagesPage;
