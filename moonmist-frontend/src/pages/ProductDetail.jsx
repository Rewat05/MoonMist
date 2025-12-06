// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import Slider from "react-slick";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const sliderSettings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  // Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("getProduct error:", err);
        setProductError(
          err.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Check favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !id) {
        setIsFavorite(false);
        return;
      }
      try {
        const res = await api.get("/favorites");
        const favorites = res.data.data || [];
        const exists = favorites.some((p) => p._id === id);
        setIsFavorite(exists);
      } catch (err) {
        console.error("checkFavorite error:", err);
      }
    };

    checkFavorite();
  }, [isAuthenticated, id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setLoadingFavorite(true);
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post("/favorites", { productId: id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("toggleFavorite error:", err);
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      await api.post("/cart", { productId: id, qty: 1 });
      window.alert("Added to cart");
    } catch (err) {
      console.error("addToCart from product detail error:", err);
      window.alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loadingProduct) {
    return (
      <div className="bg-[#f0f2f3] py-16 flex justify-center">
        <p className="text-sm text-[#636270]">Loading your nightwear…</p>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="bg-[#f0f2f3] py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-red-500 mb-4">
            {productError || "Product not found"}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#272343] text-xs md:text-sm text-[#272343] hover:border-[#029fae] hover:text-[#029fae] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/800x800?text=Moonmist"];

  return (
    <section className="bg-[#f0f2f3] py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#636270] hover:text-[#029fae] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </button>

        {/* Main Product Card */}
        <div className="bg-white rounded-3xl border border-[#e1e3e5] shadow-sm p-6 md:p-10 grid gap-10 md:grid-cols-2 items-start">
          {/* 🔥 BIG HERO IMAGE SECTION */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[600px]">
              <Slider {...sliderSettings}>
                {images.map((src, idx) => (
                  <div key={idx}>
                    <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-[#f0f2f3] shadow-md">
                      {/* <img
                        src={src}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      /> */}
                      <img
                        src={src}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-full object-contain p-4 bg-[#f0f2f3]"
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-5">
            <h1 className="text-3xl font-semibold text-[#272343] leading-tight">
              {product.title}
            </h1>

            <p className="text-3xl font-bold text-[#029fae]">
              ₹{product.price}
            </p>

            {product.description && (
              <p className="text-sm md:text-base text-[#636270] leading-relaxed">
                {product.description}
              </p>
            )}

            {product.categories?.length > 0 && (
              <p className="text-sm text-[#636270]">
                <span className="font-medium text-[#272343]">Categories: </span>
                {product.categories.join(", ")}
              </p>
            )}

            {/* Attributes */}
            {product.attributes && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[#272343]">
                  Product Details
                </h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-3 py-1 rounded-full bg-[#f7fafc] border border-[#e1e3e5] text-[#272343]"
                    >
                      <strong>{key}:</strong> {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#029fae] text-white text-sm font-medium shadow hover:bg-[#01808c] transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={handleToggleFavorite}
                disabled={loadingFavorite}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border text-sm transition-all ${
                  isFavorite
                    ? "border-rose-400 bg-rose-50 text-rose-500"
                    : "border-[#e1e3e5] text-[#272343] hover:border-rose-400 hover:text-rose-500"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "fill-rose-400 stroke-rose-500" : ""
                  }`}
                />
                {isFavorite ? "Added to Favorites" : "Add to Favorites"}
              </button>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-[#e1e3e5]">
              <p className="text-[11px] tracking-wide text-[#9a9ca5] uppercase">
                made by rewat raj tomar
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;

// // src/pages/ProductDetail.jsx
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/client";
// import { useAuth } from "../context/AuthContext";
// import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
// import Slider from "react-slick";

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuth();

//   const [product, setProduct] = useState(null);
//   const [loadingProduct, setLoadingProduct] = useState(true);
//   const [productError, setProductError] = useState("");

//   const [isFavorite, setIsFavorite] = useState(false);
//   const [loadingFavorite, setLoadingFavorite] = useState(false);

//   const sliderSettings = {
//     dots: true,
//     arrows: true,
//     infinite: true,
//     speed: 400,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     adaptiveHeight: true,
//   };

//   // Load product details
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoadingProduct(true);
//         setProductError("");
//         const res = await api.get(`/products/${id}`);
//         setProduct(res.data);
//       } catch (err) {
//         console.error("getProduct error:", err);
//         setProductError(
//           err.response?.data?.message || "Failed to load product"
//         );
//       } finally {
//         setLoadingProduct(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   // Check favorites
//   useEffect(() => {
//     const checkFavorite = async () => {
//       if (!isAuthenticated || !id) {
//         setIsFavorite(false);
//         return;
//       }
//       try {
//         const res = await api.get("/favorites");
//         const favorites = res.data.data || [];
//         const exists = favorites.some((p) => p._id === id);
//         setIsFavorite(exists);
//       } catch (err) {
//         console.error("checkFavorite error:", err);
//       }
//     };

//     checkFavorite();
//   }, [isAuthenticated, id]);

//   const handleToggleFavorite = async () => {
//     if (!isAuthenticated) {
//       navigate("/auth/login", { state: { from: `/products/${id}` } });
//       return;
//     }

//     try {
//       setLoadingFavorite(true);
//       if (isFavorite) {
//         await api.delete(`/favorites/${id}`);
//         setIsFavorite(false);
//       } else {
//         await api.post("/favorites", { productId: id });
//         setIsFavorite(true);
//       }
//     } catch (err) {
//       console.error("toggleFavorite error:", err);
//     } finally {
//       setLoadingFavorite(false);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!isAuthenticated) {
//       navigate("/auth/login", { state: { from: `/products/${id}` } });
//       return;
//     }

//     try {
//       await api.post("/cart", { productId: id, qty: 1 });
//       window.alert("Added to cart");
//     } catch (err) {
//       console.error("addToCart from product detail error:", err);
//       window.alert(err.response?.data?.message || "Failed to add to cart");
//     }
//   };

//   if (loadingProduct) {
//     return <p className="text-center py-10">Loading product…</p>;
//   }

//   if (productError || !product) {
//     return (
//       <div className="py-10 text-center">
//         <p className="text-red-400 mb-4">
//           {productError || "Product not found"}
//         </p>
//         <button
//           onClick={() => navigate("/products")}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-600 text-sm"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to products
//         </button>
//       </div>
//     );
//   }

//   const images =
//     product.images && product.images.length > 0
//       ? product.images
//       : ["https://via.placeholder.com/600x600?text=Moonmist"];

//   return (
//     <section className="grid gap-8 md:grid-cols-[1.1fr,0.9fr] items-start">
//       {/* Left: Image slider */}
//       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-center">
//         <div className="w-full max-w-md moonmist-slider">
//           <Slider {...sliderSettings}>
//             {images.map((src, idx) => (
//               <div key={idx}>
//                 <img
//                   src={src}
//                   alt={`${product.title} ${idx + 1}`}
//                   className="block mx-auto rounded-xl"
//                 />
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>

//       {/* Right: Info (unchanged) */}
//       <div className="space-y-4">
//         <button
//           onClick={() => navigate(-1)}
//           className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 mb-2"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back
//         </button>

//         <h1 className="text-2xl font-semibold">{product.title}</h1>

//         <p className="text-lg font-semibold">₹{product.price}</p>

//         {product.description && (
//           <p className="text-sm text-slate-300">{product.description}</p>
//         )}

//         {product.categories && product.categories.length > 0 && (
//           <div className="text-sm text-slate-400">
//             <span className="font-medium text-slate-200">Categories: </span>
//             {product.categories.join(", ")}
//           </div>
//         )}

//         {product.attributes && typeof product.attributes === "object" && (
//           <div className="mt-3 space-y-1">
//             <h2 className="text-sm font-semibold text-slate-200">Attributes</h2>
//             <div className="flex flex-wrap gap-2 text-xs">
//               {Object.entries(product.attributes).map(([key, value]) => (
//                 <span
//                   key={key}
//                   className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700"
//                 >
//                   <span className="font-medium">{key}:</span>{" "}
//                   <span>{String(value)}</span>
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="flex items-center gap-3 pt-4">
//           <button
//             type="button"
//             onClick={handleAddToCart}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-medium"
//           >
//             <ShoppingCart className="w-4 h-4" />
//             Add to cart
//           </button>

//           <button
//             type="button"
//             onClick={handleToggleFavorite}
//             disabled={loadingFavorite}
//             className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${
//               isFavorite
//                 ? "border-rose-500 bg-rose-500/10 text-rose-100"
//                 : "border-slate-600 text-slate-200 hover:border-rose-400 hover:text-rose-100"
//             } disabled:opacity-40`}
//           >
//             <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-400" : ""}`} />
//             {isFavorite ? "Remove from favorites" : "Add to favorites"}
//           </button>
//         </div>

//         <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
//           <p>
//             ID: <code>{product._id}</code>
//           </p>
//           <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductDetail;
