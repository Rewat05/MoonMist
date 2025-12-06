// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Trash2 } from "lucide-react";

const LIMIT = 20;

const AdminProducts = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state for new product
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    categoriesText: "",
    attributesJson: "",
  });

  // NEW: local file state for images
  const [images, setImages] = useState([]); // Array<File>
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    fetchProducts();
  }, [page, q]);

  const totalPages = Math.max(1, Math.ceil(meta.total / LIMIT));

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: handle file input change
  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      window.alert("Title and price are required");
      return;
    }

    let priceNumber = Number(form.price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      window.alert("Price must be a non-negative number");
      return;
    }

    // categories: comma separated text, backend will parse it
    const categoriesText = form.categoriesText.trim();

    // attributes: optional JSON string
    let attributesString = "";
    if (form.attributesJson.trim()) {
      try {
        // validate JSON on frontend
        JSON.parse(form.attributesJson.trim());
        attributesString = form.attributesJson.trim();
      } catch (err) {
        window.alert("Attributes must be valid JSON (or leave empty)");
        return;
      }
    }

    // Build FormData for multipart/form-data
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("price", String(priceNumber));

    // backend expects "categories" & "attributes"
    if (categoriesText) {
      fd.append("categories", categoriesText); // "shirts, men"
    }
    if (attributesString) {
      fd.append("attributes", attributesString); // JSON string
    }

    // append images (files) - field name must match upload.array("images")
    images.forEach((file) => {
      fd.append("images", file);
    });

    try {
      setCreating(true);
      const res = await api.post("/products", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // backend returns the created product object directly
      const created = res.data;

      // add new product to top of list
      setProducts((prev) => [created, ...prev]);
      setMeta((prev) => ({ ...prev, total: prev.total + 1 }));

      // reset form + files
      setForm({
        title: "",
        description: "",
        price: "",
        categoriesText: "",
        attributesJson: "",
      });
      setImages([]);
    } catch (err) {
      console.error("createProduct error:", err);
      window.alert(err.response?.data?.message || "Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirm = window.confirm(
      "Delete this product? It will be removed from all carts and favorites."
    );
    if (!confirm) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error("deleteProduct error:", err);
      window.alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin – Products</h1>
          <p className="text-sm text-slate-400">
            Logged in as {user?.name} ({user?.role})
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQ(searchInput.trim());
          }}
          className="flex gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-medium"
          >
            Search
          </button>
        </form>
      </header>

      {/* Create product form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold mb-1">Create new product</h2>
        <form
          onSubmit={handleCreateProduct}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label className="block text-xs text-slate-400">
              Title<span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
              placeholder="Product title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-400">
              Price (₹)<span className="text-red-400">*</span>
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
              placeholder="1000"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs text-slate-400">Description</label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm resize-y"
              placeholder="Short description…"
            />
          </div>

          {/* CHANGED: from Image URL to file input for Cloudinary */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-400">
              Product images (upload)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
            />
            {images.length > 0 && (
              <p className="text-[11px] text-slate-400">
                Selected: {images.length} file{images.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-400">
              Categories (comma separated)
            </label>
            <input
              name="categoriesText"
              value={form.categoriesText}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
              placeholder="shoes, men, sports"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs text-slate-400">
              Attributes (JSON, optional)
            </label>
            <textarea
              name="attributesJson"
              rows={2}
              value={form.attributesJson}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono resize-y"
              placeholder='{"size":"M","color":"black"}'
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-medium disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create product"}
            </button>
          </div>
        </form>
      </div>

      {/* Products list */}
      {loading ? (
        <p className="text-center py-10">Loading products…</p>
      ) : error ? (
        <p className="text-center text-red-400 py-10">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-slate-400 py-10">No products found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Categories</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-800">
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium truncate max-w-xs">
                        {p.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-2 max-w-xs">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">₹{p.price}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-xs text-slate-300">
                        {p.categories?.join(", ")}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-slate-500 hidden md:table-cell">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-700 text-xs text-slate-300 hover:border-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-4">
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

export default AdminProducts;

// // src/pages/AdminProducts.jsx
// import { useEffect, useState } from "react";
// import api from "../api/client";
// import { useAuth } from "../context/AuthContext";
// import { Trash2 } from "lucide-react";

// const LIMIT = 20;

// const AdminProducts = () => {
//   const { user } = useAuth();

//   const [products, setProducts] = useState([]);
//   const [meta, setMeta] = useState({ total: 0, page: 1, limit: LIMIT });
//   const [page, setPage] = useState(1);
//   const [q, setQ] = useState("");
//   const [searchInput, setSearchInput] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // form state for new product
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     price: "",
//     imageUrl: "",
//     categoriesText: "",
//     attributesJson: "",
//   });
//   const [creating, setCreating] = useState(false);

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

//   useEffect(() => {
//     fetchProducts();
//   }, [page, q]);

//   const totalPages = Math.max(1, Math.ceil(meta.total / LIMIT));

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCreateProduct = async (e) => {
//     e.preventDefault();
//     if (!form.title.trim() || !form.price) {
//       window.alert("Title and price are required");
//       return;
//     }

//     let priceNumber = Number(form.price);
//     if (Number.isNaN(priceNumber) || priceNumber < 0) {
//       window.alert("Price must be a non-negative number");
//       return;
//     }

//     // images: single URL for now
//     const images = form.imageUrl.trim() ? [form.imageUrl.trim()] : [];

//     // categories: comma separated
//     const categories = form.categoriesText
//       .split(",")
//       .map((c) => c.trim())
//       .filter(Boolean);

//     // attributes: optional JSON
//     let attributes = {};
//     if (form.attributesJson.trim()) {
//       try {
//         attributes = JSON.parse(form.attributesJson.trim());
//       } catch (err) {
//         window.alert("Attributes must be valid JSON (or leave empty)");
//         return;
//       }
//     }

//     const body = {
//       title: form.title.trim(),
//       description: form.description.trim() || undefined,
//       price: priceNumber,
//       images,
//       categories,
//       attributes,
//     };

//     try {
//       setCreating(true);
//       const res = await api.post("/products", body);

//       // add new product to top of list
//       setProducts((prev) => [res.data, ...prev]);
//       setMeta((prev) => ({ ...prev, total: prev.total + 1 }));

//       // reset form
//       setForm({
//         title: "",
//         description: "",
//         price: "",
//         imageUrl: "",
//         categoriesText: "",
//         attributesJson: "",
//       });
//     } catch (err) {
//       console.error("createProduct error:", err);
//       window.alert(err.response?.data?.message || "Failed to create product");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleDeleteProduct = async (id) => {
//     const confirm = window.confirm(
//       "Delete this product? It will be removed from all carts and favorites."
//     );
//     if (!confirm) return;

//     try {
//       await api.delete(`/products/${id}`);
//       setProducts((prev) => prev.filter((p) => p._id !== id));
//       setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
//     } catch (err) {
//       console.error("deleteProduct error:", err);
//       window.alert(err.response?.data?.message || "Failed to delete product");
//     }
//   };

//   return (
//     <section className="space-y-6">
//       <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">Admin – Products</h1>
//           <p className="text-sm text-slate-400">
//             Logged in as {user?.name} ({user?.role})
//           </p>
//         </div>

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             setPage(1);
//             setQ(searchInput.trim());
//           }}
//           className="flex gap-2 w-full sm:w-auto"
//         >
//           <input
//             type="text"
//             placeholder="Search products…"
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="flex-1 sm:w-64 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
//           />
//           <button
//             type="submit"
//             className="px-3 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-medium"
//           >
//             Search
//           </button>
//         </form>
//       </header>

//       {/* Create product form */}
//       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
//         <h2 className="text-lg font-semibold mb-1">Create new product</h2>
//         <form
//           onSubmit={handleCreateProduct}
//           className="grid gap-3 md:grid-cols-2"
//         >
//           <div className="space-y-2">
//             <label className="block text-xs text-slate-400">
//               Title<span className="text-red-400">*</span>
//             </label>
//             <input
//               name="title"
//               value={form.title}
//               onChange={handleFormChange}
//               className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
//               placeholder="Product title"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-xs text-slate-400">
//               Price (₹)<span className="text-red-400">*</span>
//             </label>
//             <input
//               name="price"
//               type="number"
//               step="0.01"
//               value={form.price}
//               onChange={handleFormChange}
//               className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
//               placeholder="1000"
//               required
//             />
//           </div>

//           <div className="space-y-2 md:col-span-2">
//             <label className="block text-xs text-slate-400">Description</label>
//             <textarea
//               name="description"
//               rows={2}
//               value={form.description}
//               onChange={handleFormChange}
//               className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm resize-y"
//               placeholder="Short description…"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-xs text-slate-400">
//               Image URL (first image)
//             </label>
//             <input
//               name="imageUrl"
//               value={form.imageUrl}
//               onChange={handleFormChange}
//               className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
//               placeholder="https://…"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-xs text-slate-400">
//               Categories (comma separated)
//             </label>
//             <input
//               name="categoriesText"
//               value={form.categoriesText}
//               onChange={handleFormChange}
//               className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
//               placeholder="shoes, men, sports"
//             />
//           </div>

//           <div className="space-y-2 md:col-span-2">
//             <label className="block text-xs text-slate-400">
//               Attributes (JSON, optional)
//             </label>
//             <textarea
//               name="attributesJson"
//               rows={2}
//               value={form.attributesJson}
//               onChange={handleFormChange}
//               className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono resize-y"
//               placeholder='{"size":"M","color":"black"}'
//             />
//           </div>

//           <div className="md:col-span-2 flex justify-end">
//             <button
//               type="submit"
//               disabled={creating}
//               className="px-4 py-2 rounded-full bg-slate-100 text-slate-900 text-sm font-medium disabled:opacity-60"
//             >
//               {creating ? "Creating…" : "Create product"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Products list */}
//       {loading ? (
//         <p className="text-center py-10">Loading products…</p>
//       ) : error ? (
//         <p className="text-center text-red-400 py-10">{error}</p>
//       ) : products.length === 0 ? (
//         <p className="text-center text-slate-400 py-10">No products found.</p>
//       ) : (
//         <>
//           <div className="overflow-x-auto rounded-xl border border-slate-800">
//             <table className="min-w-full text-sm">
//               <thead className="bg-slate-900 border-b border-slate-800">
//                 <tr>
//                   <th className="px-3 py-2 text-left">Title</th>
//                   <th className="px-3 py-2 text-left">Price</th>
//                   <th className="px-3 py-2 text-left">Categories</th>
//                   <th className="px-3 py-2 text-left hidden md:table-cell">
//                     Created
//                   </th>
//                   <th className="px-3 py-2 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {products.map((p) => (
//                   <tr key={p._id} className="border-b border-slate-800">
//                     <td className="px-3 py-2 align-top">
//                       <div className="font-medium truncate max-w-xs">
//                         {p.title}
//                       </div>
//                       <div className="text-xs text-slate-400 line-clamp-2 max-w-xs">
//                         {p.description}
//                       </div>
//                     </td>
//                     <td className="px-3 py-2 align-top">₹{p.price}</td>
//                     <td className="px-3 py-2 align-top">
//                       <div className="text-xs text-slate-300">
//                         {p.categories?.join(", ")}
//                       </div>
//                     </td>
//                     <td className="px-3 py-2 align-top text-xs text-slate-500 hidden md:table-cell">
//                       {p.createdAt
//                         ? new Date(p.createdAt).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td className="px-3 py-2 align-top text-right">
//                       <button
//                         type="button"
//                         onClick={() => handleDeleteProduct(p._id)}
//                         className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-700 text-xs text-slate-300 hover:border-red-400 hover:text-red-300"
//                       >
//                         <Trash2 className="w-3 h-3" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-center gap-3 mt-4">
//             <button
//               type="button"
//               onClick={() => setPage((prev) => Math.max(1, prev - 1))}
//               disabled={page <= 1}
//               className="px-3 py-1 rounded-full border border-slate-600 text-sm disabled:opacity-40"
//             >
//               Prev
//             </button>
//             <span className="text-sm text-slate-300">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               type="button"
//               onClick={() =>
//                 setPage((prev) => (prev < totalPages ? prev + 1 : prev))
//               }
//               disabled={page >= totalPages}
//               className="px-3 py-1 rounded-full border border-slate-600 text-sm disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </section>
//   );
// };

// export default AdminProducts;
