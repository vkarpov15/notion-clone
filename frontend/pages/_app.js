import App from "next/app";
import cookies from "next-cookies";

import UserProvider from "../context/UserContext";
import Layout from "../components/layout";

import "typeface-nunito-sans";
import "typeface-roboto";
import "../shared/global.scss";

const MyApp = ({ Component, pageProps }) => {
  return (
    <UserProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </UserProvider>
  );
};

export default MyApp;
