import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { SpotlightButton } from "../components/SpotlightButton";

export const LoginView = ({ onLogin, navigate }: { onLogin: (role: "student" | "admin", name: string) => void, navigate: any }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
  
  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation Regex
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  const validate = () => {
    setError(null);
    if (!identifier) return "Email or Phone is required.";
    if (isRegistering) {
       if (!passwordRegex.test(password)) {
         return "Password must be at least 8 characters, contain 1 uppercase letter, and 1 special character.";
       }
       if (password !== confirmPassword) {
         return "Passwords do not match.";
       }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simulate login logic
    const name = role === "student" ? (isRegistering ? "New Student" : "Alex Student") : "Admin Volunteer";
    onLogin(role, name);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-serif font-bold text-eggplant dark:text-white mb-2">
             {isRegistering ? "Join the Community" : "Welcome Back"}
           </h2>
           <p className="text-slate-500 text-sm">
             {isRegistering ? "Create an account to start sharing." : "Log in to access your dashboard."}
           </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setRole("student")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "student" ? "bg-white dark:bg-slate-600 text-eggplant dark:text-teal-200 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Student
          </button>
          <button 
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "admin" ? "bg-white dark:bg-slate-600 text-eggplant dark:text-teal-200 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Admin / Volunteer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              {role === "student" ? "Email or Phone Number" : "Admin Email"}
            </label>
            <input 
              type="text" 
              required 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
              placeholder={role === "student" ? "you@example.com" : "admin@upwardease.org"}
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white pr-10"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-eggplant">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isRegistering && (
             <div className="relative">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
             </div>
          )}

          {error && (
            <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-100 flex items-start gap-2">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <SpotlightButton 
            type="submit" 
            className="w-full bg-eggplant text-white py-3.5 rounded-xl font-bold hover:bg-eggplant-dark transition-all shadow-md mt-4"
          >
            {isRegistering ? "Create Account" : "Log In"}
          </SpotlightButton>
        </form>

        <div className="text-center mt-6">
           <p className="text-sm text-slate-400">
             {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
             <button 
               onClick={() => { setIsRegistering(!isRegistering); setError(null); }} 
               className="text-eggplant dark:text-teal-400 font-bold hover:underline"
             >
               {isRegistering ? "Log In" : "Sign Up"}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};