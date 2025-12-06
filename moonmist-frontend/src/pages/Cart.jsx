// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { Trash2 } from "lucide-react";

const Cart = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/cart");
      setItems(res.data.items || []);
      setMeta(res.data.meta || { totalItems: 0 });
    } catch (err) {
      console.error("getCart error:", err);
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      // reload from server so qty + total stay correct
      await fetchCart();
    } catch (err) {
      console.error("removeCartItem error:", err);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 0),
    0
  );

  if (loading) {
    return (
      <section className="bg-[#f0f2f3] py-16">
        <p className="text-center text-sm text-[#636270]">
          Loading your cozy cart…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#f0f2f3] py-16">
        <p className="text-center text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl max-w-md mx-auto px-4 py-6">
          {error}
        </p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-[#f0f2f3] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-[#e1e3e5] shadow-sm max-w-lg mx-auto px-6 py-10 text-center space-y-3">
            <h1 className="text-2xl font-semibold text-[#272343]">
              Your cart is empty
            </h1>
            <p className="text-sm text-[#636270]">
              Add some MoonMist nightwear to see it here.
            </p>
            <Link
              to="/products"
              className="inline-flex px-5 py-2.5 rounded-full bg-[#029fae] text-white text-sm font-medium shadow-sm hover:bg-[#01808c] transition-colors"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f0f2f3] py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <header className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#272343]">
              Your cart
            </h1>
            <p className="text-sm text-[#636270]">
              {meta.totalItems} item{meta.totalItems !== 1 ? "s" : ""} ready for
              cozy nights.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr] items-start">
          {/* Items list */}
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.product || {};
              const productId = product._id;
              const imageUrl =
                product.images && product.images.length
                  ? product.images[0]
                  : "https://via.placeholder.com/200x200?text=Moonmist";

              const lineTotal = (item.price || 0) * (item.qty || 0);

              return (
                <div
                  key={productId}
                  className="flex gap-4 bg-white border border-[#e1e3e5] rounded-2xl p-4 shadow-sm"
                >
                  <Link
                    to={`/products/${productId}`}
                    className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-xl bg-[#f0f2f3]"
                  >
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <Link
                      to={`/products/${productId}`}
                      className="text-sm md:text-base font-medium text-[#272343] hover:underline"
                    >
                      {product.title || "Untitled product"}
                    </Link>
                    <p className="text-xs md:text-sm text-[#636270]">
                      Price: ₹{item.price} &middot; Qty: {item.qty}
                    </p>
                    <p className="text-sm md:text-base font-semibold text-[#272343]">
                      Line total: ₹{lineTotal}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(productId)}
                    className="self-start p-2 rounded-full border border-[#e1e3e5] text-[#636270] hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="bg-white border border-[#e1e3e5] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-[#272343]">
              Order summary
            </h2>
            <div className="flex items-center justify-between text-sm md:text-base text-[#272343]">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            <p className="text-xs text-[#9a9ca5]">
              Taxes and shipping are not calculated here (demo only).
            </p>
            <button
              type="button"
              className="w-full mt-2 py-2.5 rounded-full bg-[#029fae] text-white text-sm font-medium shadow-sm disabled:opacity-50"
              disabled
            >
              Checkout (coming soon)
            </button>
            <p className="text-[11px] text-[#9a9ca5] text-center">
              Free shipping on orders over Rs 1500.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Cart;

// // src/pages/Cart.jsx
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../api/client";
// import { Trash2 } from "lucide-react";

// const Cart = () => {
//   const [items, setItems] = useState([]);
//   const [meta, setMeta] = useState({ totalItems: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchCart = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await api.get("/cart");
//       setItems(res.data.items || []);
//       setMeta(res.data.meta || { totalItems: 0 });
//     } catch (err) {
//       console.error("getCart error:", err);
//       setError(err.response?.data?.message || "Failed to load cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const handleRemoveItem = async (productId) => {
//     try {
//       await api.delete(`/cart/${productId}`);
//       // reload from server so qty + total stay correct
//       await fetchCart();
//     } catch (err) {
//       console.error("removeCartItem error:", err);
//     }
//   };

//   const subtotal = items.reduce(
//     (sum, item) => sum + (item.price || 0) * (item.qty || 0),
//     0
//   );

//   if (loading) {
//     return <p className="text-center py-10">Loading cart…</p>;
//   }

//   if (error) {
//     return <p className="text-center text-red-400 py-10">{error}</p>;
//   }

//   if (!items.length) {
//     return (
//       <section className="text-center py-16">
//         <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
//         <p className="text-slate-400 mb-6">
//           Add some products to your cart to see them here.
//         </p>
//         <Link
//           to="/products"
//           className="inline-flex px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-medium"
//         >
//           Browse products
//         </Link>
//       </section>
//     );
//   }

//   return (
//     <section className="space-y-6">
//       <header className="flex items-center justify-between gap-2">
//         <div>
//           <h1 className="text-2xl font-semibold">Cart</h1>
//           <p className="text-sm text-slate-400">
//             {meta.totalItems} item{meta.totalItems !== 1 ? "s" : ""} in your
//             cart.
//           </p>
//         </div>
//       </header>

//       <div className="grid gap-6 md:grid-cols-[2fr,1fr] items-start">
//         {/* Items list */}
//         <div className="space-y-3">
//           {items.map((item) => {
//             const product = item.product || {};
//             const productId = product._id;
//             const imageUrl =
//               product.images && product.images.length
//                 ? product.images[0]
//                 : "https://via.placeholder.com/200x200?text=Moonmist";

//             const lineTotal = (item.price || 0) * (item.qty || 0);

//             return (
//               <div
//                 key={productId}
//                 className="flex gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3"
//               >
//                 <Link
//                   to={`/products/${productId}`}
//                   className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800"
//                 >
//                   <img
//                     src={imageUrl}
//                     alt={product.title}
//                     className="w-full h-full object-cover"
//                   />
//                 </Link>

//                 <div className="flex-1 flex flex-col gap-1">
//                   <Link
//                     to={`/products/${productId}`}
//                     className="text-sm font-medium hover:underline"
//                   >
//                     {product.title || "Untitled product"}
//                   </Link>
//                   <p className="text-xs text-slate-400">
//                     Price: ₹{item.price} &middot; Qty: {item.qty}
//                   </p>
//                   <p className="text-sm font-semibold">
//                     Line total: ₹{lineTotal}
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => handleRemoveItem(productId)}
//                   className="self-start p-2 rounded-full border border-slate-700 text-slate-300 hover:border-red-400 hover:text-red-300"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             );
//           })}
//         </div>

//         {/* Summary */}
//         <aside className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
//           <h2 className="text-lg font-semibold">Summary</h2>
//           <div className="flex items-center justify-between text-sm">
//             <span>Subtotal</span>
//             <span>₹{subtotal}</span>
//           </div>
//           <p className="text-xs text-slate-500">
//             Taxes and shipping are not calculated here (demo only).
//           </p>
//           <button
//             type="button"
//             className="w-full mt-2 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-medium disabled:opacity-50"
//             disabled
//           >
//             Checkout (coming soon)
//           </button>
//         </aside>
//       </div>
//     </section>
//   );
// };

// export default Cart;
