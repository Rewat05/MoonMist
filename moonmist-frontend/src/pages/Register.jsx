import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="min-h-[calc(100vh-140px)] bg-[#f0f2f3] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e1e3e5] shadow-sm p-7 md:p-8 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://res.cloudinary.com/dh0a6vbts/image/upload/v1765038044/logo_picture_moonmist_v2edys.png" // <-- update path if needed
            alt="MoonMist logo"
            className="w-20 h-20 object-contain"
          />
          <div className="text-center space-y-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#272343]">
              Create your MoonMist account
            </h1>
            <p className="text-xs md:text-sm text-[#636270]">
              Join the cozy nightwear community.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-medium text-[#272343]"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e1e3e5] bg-[#f9fafb] text-sm text-[#272343] outline-none focus:border-[#029fae] focus:ring-1 focus:ring-[#029fae] transition"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#029fae] text-white text-sm font-medium shadow-sm hover:bg-[#01808c] transition-colors"
          >
            Register
          </button>
        </form>

        {/* Bottom Text */}
        <p className="text-xs md:text-sm text-[#636270] text-center">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-[#029fae] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Register = () => {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await register(form.name, form.email, form.password);
//       navigate("/");
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Registration failed");
//     }
//   };

//   return (
//     <section className="max-w-md mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">Create account</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           name="name"
//           placeholder="Name"
//           value={form.name}
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700"
//         />
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
//           Register
//         </button>
//       </form>
//       <p className="mt-3 text-sm text-slate-400">
//         Already have an account?{" "}
//         <Link to="/auth/login" className="text-slate-100 underline">
//           Login
//         </Link>
//       </p>
//     </section>
//   );
// };

// export default Register;
