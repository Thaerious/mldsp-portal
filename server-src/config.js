import dotenv from "dotenv";
dotenv.config();

const config = {
    server: {
        SOURCE_VIEW: "views",
        PUBLIC_STATIC: "public",
    },
    auth: {
        authRequired: false,
        auth0Logout: true,
        secret: process.env.SECRET,
        baseURL: `${process.env.SERVER_URL}`,
        clientID: process.env.CLIENT_ID,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        routes: {
            callback: `/success`,
            postLogoutRedirect: `/index`,
            login: false,            
        },
    }
};
export default config;

