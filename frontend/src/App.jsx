import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';  // ✅ Updated path
import Login from './components/Login';
import Shops from './components/Shops';
// import ShopPage from './components/ShopPage';
// import Products from './components/Products';
import Cart from './components/Cart';
import ShopProducts from './components/ShopProducts';
import ShopPage from './components/ShopPage'
import ShopList from './components/ShopList';
import ShopDetails from './components/ShopDetails';
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} /> {/* ✅ Admin Route */}
                <Route path="/shops" element={<Shops />} />
                <Route path="/dashboard/purchase/:shopName" element={<ShopProducts />} />
                {/* <Route path="/dashboard/products"element={<Products/>}/> */}
                <Route path="/cart" element={<Cart/>}/>
                <Route path="/shop/:shopName" element={<ShopPage />} />
                <Route path="/shoplist" element={<ShopList />} />
                <Route path="/shop-details/:shopName" element={<ShopDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
