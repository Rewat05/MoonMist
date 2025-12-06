// src/pages/Favorites.jsx
import { useEffect, useState } from "react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/favorites");
      setFavorites(res.data.data || []);
    } catch (err) {
      console.error("getFavorites error:", err);
      setError(err.response?.data?.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      setFavorites((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("removeFavorite error:", err);
    }
  };

  // const handleAddToCart = async (productId) => {
  //   console.log("Add to cart from Favorites:", productId);
  //   // later: await api.post("/cart", { productId, qty: 1 });
  // };

    const handleAddToCart = async (productId) => {
    try {
      await api.post("/cart", { productId, qty: 1 });
      window.alert("Added to cart");
    } catch (err) {
      console.error("addToCart from favorites error:", err);
      window.alert(
        err.response?.data?.message || "Failed to add to cart"
      );
    }
  };


  if (loading) {
    return <p className="text-center py-10">Loading favorites…</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 py-10">{error}</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Favorites</h1>
        <p className="text-sm text-slate-400">
          {user ? `Saved items for ${user.name}.` : "Your saved items."}
        </p>
      </header>

      {favorites.length === 0 ? (
        <p className="text-slate-400 py-10 text-center">
          You have no favorites yet.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Favorites;
