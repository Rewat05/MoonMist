// src/pages/Products.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

const LIMIT = 12;

const Products = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/products", {
        params: { page, limit: LIMIT, q: q || undefined },
      });

      setProducts(res.data.data || []);
      setMeta(res.data.meta || { total: 0, page, limit: LIMIT });
    } catch (err) {
      console.error("getAllProducts error:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites (for logged-in user)
  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const res = await api.get("/favorites");
      const ids = (res.data.data || []).map((p) => p._id);
      setFavoriteIds(new Set(ids));
    } catch (err) {
      console.error("getFavorites error:", err);
      // don't show UI error, just silently fail
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, q]);

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const totalPages = Math.max(1, Math.ceil(meta.total / LIMIT));

  // Toggle favorite
  const handleToggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: "/products" } });
      return;
    }

    try {
      const isFav = favoriteIds.has(productId);
      if (isFav) {
        await api.delete(`/favorites/${productId}`);
        const next = new Set(favoriteIds);
        next.delete(productId);
        setFavoriteIds(next);
      } else {
        await api.post("/favorites", { productId });
        const next = new Set(favoriteIds);
        next.add(productId);
        setFavoriteIds(next);
      }
    } catch (err) {
      console.error("toggleFavorite error:", err);
      // optional: toast later
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: "/products" } });
      return;
    }

    try {
      await api.post("/cart", { productId, qty: 1 });
      // simple feedback for now
      window.alert("Added to cart");
    } catch (err) {
      console.error("addToCart error:", err);
      window.alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-slate-400">
            Browse all products in the store.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="Search by title or description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
          />
          <button
            type="submit"
            className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-900 font-medium"
          >
            Search
          </button>
        </form>
      </header>

      {loading && (
        <p className="text-center text-slate-400 py-10">Loading products…</p>
      )}

      {error && !loading && (
        <p className="text-center text-red-400 py-6">{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-slate-400 py-10">
          No products found. Try a different search.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                isFavorite={favoriteIds.has(p._id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-full border border-slate-600 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-full border border-slate-600 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default Products;


// // src/pages/Products.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/client";
// import ProductCard from "../components/ProductCard";
// import { useAuth } from "../context/AuthContext";

// const LIMIT = 12;

// const Products = () => {
//   const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();

//   const [products, setProducts] = useState([]);
//   const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT });
//   const [page, setPage] = useState(1);
//   const [q, setQ] = useState("");
//   const [searchInput, setSearchInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [favoriteIds, setFavoriteIds] = useState(new Set());

//   // Fetch products
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await api.get("/products", {
//         params: { page, limit: LIMIT, q: q || undefined },
//       });

//       setProducts(res.data.data || []);
//       setMeta(res.data.meta || { total: 0, page, limit: LIMIT });
//     } catch (err) {
//       console.error("getAllProducts error:", err);
//       setError(err.response?.data?.message || "Failed to load products");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch favorites (for logged-in user)
//   const fetchFavorites = async () => {
//     if (!isAuthenticated) {
//       setFavoriteIds(new Set());
//       return;
//     }
//     try {
//       const res = await api.get("/favorites");
//       const ids = (res.data.data || []).map((p) => p._id);
//       setFavoriteIds(new Set(ids));
//     } catch (err) {
//       console.error("getFavorites error:", err);
//       // don't show UI error, just silently fail
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [page, q]);

//   useEffect(() => {
//     fetchFavorites();
//   }, [isAuthenticated]);

//   const totalPages = Math.max(1, Math.ceil(meta.total / LIMIT));

//   // Toggle favorite
//   const handleToggleFavorite = async (productId) => {
//     if (!isAuthenticated) {
//       navigate("/auth/login", { state: { from: "/products" } });
//       return;
//     }

//     try {
//       const isFav = favoriteIds.has(productId);
//       if (isFav) {
//         await api.delete(`/favorites/${productId}`);
//         const next = new Set(favoriteIds);
//         next.delete(productId);
//         setFavoriteIds(next);
//       } else {
//         await api.post("/favorites", { productId });
//         const next = new Set(favoriteIds);
//         next.add(productId);
//         setFavoriteIds(next);
//       }
//     } catch (err) {
//       console.error("toggleFavorite error:", err);
//       // optional: toast later
//     }
//   };

//   const handleAddToCart = async (productId) => {
//     if (!isAuthenticated) {
//       navigate("/auth/login", { state: { from: "/products" } });
//       return;
//     }

//     try {
//       await api.post("/cart", { productId, qty: 1 });
//       // simple feedback for now
//       window.alert("Added to cart");
//     } catch (err) {
//       console.error("addToCart error:", err);
//       window.alert(err.response?.data?.message || "Failed to add to cart");
//     }
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setPage(1);
//     setQ(searchInput.trim());
//   };

//   return (
//     <section className="bg-[#f0f2f3] py-8">
//       <div className="max-w-6xl mx-auto px-4 space-y-6">
//         {/* Header + Search */}
//         <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//           <div className="space-y-1">
//             <h1 className="text-2xl md:text-3xl font-semibold text-[#272343]">
//               MoonMist collection
//             </h1>
//             <p className="text-sm text-[#636270]">
//               Browse cozy luxury nightwear, curated for calm evenings.
//             </p>
//           </div>

//           <form
//             onSubmit={handleSearchSubmit}
//             className="flex w-full md:w-auto items-center gap-2"
//           >
//             <input
//               type="text"
//               placeholder="Search by title or description…"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               className="flex-1 md:w-72 px-3 py-2.5 rounded-xl border border-[#e1e3e5] bg-white text-sm text-[#272343] outline-none focus:border-[#029fae] focus:ring-1 focus:ring-[#029fae] transition"
//             />
//             <button
//               type="submit"
//               className="px-4 py-2.5 text-sm rounded-full bg-[#029fae] text-white font-medium shadow-sm hover:bg-[#01808c] transition-colors"
//             >
//               Search
//             </button>
//           </form>
//         </header>

//         {loading && (
//           <p className="text-center text-sm text-[#636270] py-10">
//             Loading products…
//           </p>
//         )}

//         {error && !loading && (
//           <p className="text-center text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-6">
//             {error}
//           </p>
//         )}

//         {!loading && !error && products.length === 0 && (
//           <p className="text-center text-sm text-[#636270] py-10">
//             No products found. Try a different search.
//           </p>
//         )}

//         {!loading && !error && products.length > 0 && (
//           <>
//             <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//               {products.map((p) => (
//                 <ProductCard
//                   key={p._id}
//                   product={p}
//                   isFavorite={favoriteIds.has(p._id)}
//                   onToggleFavorite={handleToggleFavorite}
//                   onAddToCart={handleAddToCart}
//                 />
//               ))}
//             </div>

//             {/* Pagination */}
//             <div className="flex flex-col items-center gap-3 mt-8">
//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setPage((prev) => Math.max(1, prev - 1))}
//                   disabled={page <= 1}
//                   className="px-4 py-2 rounded-full border border-[#e1e3e5] text-xs md:text-sm text-[#272343] bg-white hover:border-[#029fae] hover:text-[#029fae] disabled:opacity-40 disabled:hover:border-[#e1e3e5] disabled:hover:text-[#272343] transition-colors"
//                 >
//                   Prev
//                 </button>

//                 <span className="text-xs md:text-sm text-[#636270]">
//                   Page{" "}
//                   <span className="font-medium text-[#272343]">{page}</span> of{" "}
//                   {totalPages}
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setPage((prev) => (prev < totalPages ? prev + 1 : prev))
//                   }
//                   disabled={page >= totalPages}
//                   className="px-4 py-2 rounded-full border border-[#e1e3e5] text-xs md:text-sm text-[#272343] bg-white hover:border-[#029fae] hover:text-[#029fae] disabled:opacity-40 disabled:hover:border-[#e1e3e5] disabled:hover:text-[#272343] transition-colors"
//                 >
//                   Next
//                 </button>
//               </div>

//               <p className="text-[11px] text-[#9a9ca5]">
//                 Showing {products.length} of {meta.total} items
//               </p>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Products;