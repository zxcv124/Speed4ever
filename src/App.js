import { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import CoverPage from './pages/CoverPage/CoverPage';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SellPage from './pages/SellPage/SellPage';
import UploadProductImages from './pages/UploadProductImages/UploadProductImages';
import ProductPage from './pages/ProductPage/ProductPage';
import PostBlogPage from './pages/PostBlogPage/PostBlogPage';
import UploadCarImagePage from './pages/UploadCarImagePage/UploadCarImagePage';
import BlogPage from './pages/BlogPage/BlogPage';
import BlogsPage from './pages/BlogsPage/BlogsPage';
import AboutPage from './pages/AboutPage/AboutPage';
import ContactPage from './pages/ContactPage/ContactPage';
function App() {
  const user = useContext(AuthContext).user;
  return (
    <Routes>
      <Route path='about-us' element={<AboutPage />} />
      <Route path='contact-us' element={<ContactPage />} />
      {user && user !== "loading" ? (
        <>
          <Route path='blogs' element={<BlogsPage />} />
          <Route path='post-blog' element={<PostBlogPage />} />
          <Route path='blog/:blogId' element={<BlogPage />} />
          <Route path='post-blog/upload-car-images/:carId' element={<UploadCarImagePage />} />
          <Route path='auction/upload-images/:productId' element={<UploadProductImages />} />
          <Route path='product/:productId' element={<ProductPage />} />
          <Route path='auction' element={<SellPage />} />
          <Route path='auctions' element={<HomePage />} />
        </>
      ) : (
        <>
          <Route path='/login' element={<LoginPage />} />
        </>
      )}
      <Route path='*' element={<CoverPage />} />
    </Routes>
  );
}

export default App;
