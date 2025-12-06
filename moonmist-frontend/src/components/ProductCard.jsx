// src/components/ProductCard.jsx
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}) => {
  const { _id, title, price, images, description } = product;

  const imageUrl =
    images && images.length > 0
      ? images[0]
      : "https://via.placeholder.com/400x400?text=Moonmist";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <Link to={`/products/${_id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link to={`/products/${_id}`}>
          <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
        </Link>
        <p className="text-xs text-slate-400 line-clamp-2">
          {description || "No description provided."}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold">₹{price}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(_id)}
              className={`p-1.5 rounded-full border text-xs ${
                isFavorite
                  ? "bg-rose-500/20 border-rose-500 text-rose-200"
                  : "border-slate-600 text-slate-300 hover:border-rose-400 hover:text-rose-200"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-rose-400" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => onAddToCart(_id)}
              className="px-2 py-1 rounded-full border border-slate-600 text-xs flex items-center gap-1 hover:border-slate-300"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
