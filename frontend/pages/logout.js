import { useEffect } from "react";
import useRouter from "next/router";

const LogoutPage = () => {
  useEffect(() => {
    const logoutOnServer = async () => {
      const router = useRouter;
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API}/users/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: window.localStorage.getItem("token") || "",
          },
        });
        window.localStorage.setItem('token', '');
        router.push("/login");
      } catch (err) {
        console.log(err);
      }
    };
    logoutOnServer();
  }, []);
  return null;
};

export default LogoutPage;
