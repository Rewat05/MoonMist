import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const from = location.state?.from || "/";

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="min-h-[calc(100vh-140px)] bg-[#f0f2f3] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e1e3e5] shadow-sm p-7 md:p-8 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          {/* update src path to where you keep this logo file */}
          <img
            src="https://res.cloudinary.com/dh0a6vbts/image/upload/v1765038044/logo_picture_moonmist_v2edys.png"
            alt="MoonMist logo"
            className="w-20 h-20 object-contain"
          />
          <div className="text-center space-y-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#272343]">
              Welcome back to MoonMist
            </h1>
            <p className="text-xs md:text-sm text-[#636270]">
              Log in to continue your cozy nightwear journey.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-[#272343]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e1e3e5] bg-[#f9fafb] text-sm text-[#272343] outline-none focus:border-[#029fae] focus:ring-1 focus:ring-[#029fae] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-[#272343]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e1e3e5] bg-[#f9fafb] text-sm text-[#272343] outline-none focus:border-[#029fae] focus:ring-1 focus:ring-[#029fae] transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#029fae] text-white text-sm font-medium shadow-sm hover:bg-[#01808c] transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-xs md:text-sm text-[#636270] text-center">
          No account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-[#029fae] hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;

// import { useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const from = location.state?.from || "/";

//   const handleChange = (e) => {
//     setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await login(form.email, form.password);
//       navigate(from, { replace: true });
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <section className="max-w-md mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">Login</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700"
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700"
//         />
//         {error && <p className="text-red-400 text-sm">{error}</p>}
//         <button
//           type="submit"
//           className="w-full py-2 rounded bg-slate-100 text-slate-900 font-medium"
//         >
//           Login
//         </button>
//       </form>
//       <p className="mt-3 text-sm text-slate-400">
//         No account?{" "}
//         <Link to="/auth/register" className="text-slate-100 underline">
//           Register
//         </Link>
//       </p>
//     </section>
//   );
// };

// export default Login;
