import Notice from "../components/notice";
import { useEffect, useState } from "react";

const query = typeof window === 'undefined' ? new Map() : new URLSearchParams(window.location.search);

const ActivateAccountPage = () => {
  if (!query.has('token')) {
    throw new Error("Missing activation code.");
  }

  const [message, setMessage] = useState(query.has('token') ? null : "Missing activation code");
  const [activated, setActivated] = useState(query.has('token') ? false : true);
  
  useEffect(() => void async function fetchData() {
    if (query.has('token')) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/users/activate`,
        {
          method: "POST",
          // Forward the authentication cookie to the backend
          headers: {
            "Content-Type": "application/json",
            Cookie: req ? req.headers.cookie : undefined,
          },
          body: JSON.stringify({
            activationToken: activationToken,
          }),
        }
      );
      const data = await response.json();
  
      if (data.errCode) {
        setMessage(data.message);
      } else {
        setMessage(data.message);
        setActivated(true);
      }
    }
  }(), []);

  const noticeType = activated ? "SUCCESS" : "ERROR";

  return (
    <>
      <h1 className="pageHeading">Activate Account</h1>
      <Notice status={noticeType}>{message}</Notice>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const req = context.req;

  try {
    const activationToken = context.query.token;
    if (!activationToken) {
      throw new Error("Missing activation code.");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/users/activate`,
      {
        method: "POST",
        // Forward the authentication cookie to the backend
        headers: {
          "Content-Type": "application/json",
          Cookie: req ? req.headers.cookie : undefined,
        },
        body: JSON.stringify({
          activationToken: activationToken,
        }),
      }
    );
    const data = await response.json();

    if (data.errCode) {
      throw new Error(data.message);
    } else {
      return { props: { activated: true, message: data.message } };
    }
  } catch (err) {
    console.log(err);
    return {
      props: {
        activated: false,
        message: err.message || "The activation process failed.",
      },
    };
  }
};

export default ActivateAccountPage;
