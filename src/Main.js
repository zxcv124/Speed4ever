import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import Layout from "./hoc/Layout/Layout";
import useCSSHeightListener from './hooks/useCSSHeightListener';


const Main = () => {
    useCSSHeightListener({ key: '--app-height', value: window.innerHeight - 0.5 });
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <Layout>
                    <App />
                </Layout>
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default Main;