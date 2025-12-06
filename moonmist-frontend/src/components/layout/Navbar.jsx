import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Heart, User, Moon, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  // Center nav (Shop, Admin)
  const navLinkClass = ({ isActive }) =>
    `px-3 py-1 text-sm font-medium capitalize rounded-full transition-colors ${
      isActive
        ? "text-[#029fae] bg-white shadow-sm"
        : "text-[#636270] hover:text-[#029fae]"
    }`;

  // Right-side buttons (Fav, Cart, Login)
  const actionLinkClass = ({ isActive }) =>
    `flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-all ${
      isActive
        ? "border-[#029fae] bg-[#029fae]/5 text-[#029fae]"
        : "border-[#e1e3e5] text-[#272343] hover:border-[#029fae] hover:text-[#029fae]"
    }`;

  return (
    <header className="w-full bg-white shadow-sm">
      {/* top strip */}
      <div className="bg-[#272343] text-white text-xs">
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-between">
          <p className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Free delivery on all orders over Rs 1500.</span>
          </p>
          {user && (
            <span className="opacity-80">
              Welcome, {user.name || "MoonMist lover"} ✨
            </span>
          )}
        </div>
      </div>

      {/* main bar */}
      <div className="bg-[#f0f2f3]">
        <div className="max-w-6xl mx-auto px-4 h-[84px] flex items-center justify-between gap-6">
          {/* logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-medium text-[#272343]"
          >
            <Moon className="w-7 h-7" color="#029fae" />
            <span className="tracking-tight">MoonMist</span>
          </Link>

          {/* center nav */}
          <nav className="flex items-center gap-3">
            <NavLink to="/products" className={navLinkClass}>
              Shop
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin/products" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* right actions */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <NavLink to="/favorites" className={actionLinkClass}>
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Fav</span>
                </NavLink>
                <NavLink to="/cart" className={actionLinkClass}>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                </NavLink>
              </>
            )}

            {user ? (
              <button
                onClick={logout}
                className="ml-1 text-sm text-[#636270] hover:text-[#029fae] transition-colors"
              >
                Logout
              </button>
            ) : (
              <NavLink to="/auth/login" className={actionLinkClass}>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

// import { Link, NavLink } from "react-router-dom";
// import { ShoppingCart, Heart, User } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";

// const Navbar = () => {
//   const { user, logout } = useAuth();

//   const linkClass = ({ isActive }) =>
//     `px-3 py-1 rounded-full text-sm ${
//       isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
//     }`;

//   return (
//     <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
//       <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
//         <Link to="/" className="font-semibold text-lg tracking-tight">
//           moonmist
//         </Link>

//         <nav className="flex items-center gap-4">
//           <NavLink to="/products" className={linkClass}>
//             Shop
//           </NavLink>
//           {user?.role === "admin" && (
//             <NavLink to="/admin/products" className={linkClass}>
//               Admin
//             </NavLink>
//           )}
//         </nav>

//         <div className="flex items-center gap-4">
//           {user && (
//             <>
//               <NavLink to="/favorites" className={linkClass}>
//                 <Heart className="inline-block w-4 h-4 mr-1" />
//                 Fav
//               </NavLink>
//               <NavLink to="/cart" className={linkClass}>
//                 <ShoppingCart className="inline-block w-4 h-4 mr-1" />
//                 Cart
//               </NavLink>
//             </>
//           )}

//           {user ? (
//             <button
//               onClick={logout}
//               className="text-sm text-slate-300 hover:text-white"
//             >
//               Logout
//             </button>
//           ) : (
//             <NavLink to="/auth/login" className={linkClass}>
//               <User className="inline-block w-4 h-4 mr-1" />
//               Login
//             </NavLink>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
