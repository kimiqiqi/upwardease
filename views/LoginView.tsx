import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert, User, GraduationCap, School, Calendar } from "lucide-react";
import { UserType } from "../types";
import { SpotlightButton } from "../components/SpotlightButton";

export const LoginView = ({ onLogin, navigate }: { onLogin: (userData: Partial<UserType>) => void, navigate: any }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
  
  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // New Profile Fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Validation Regex
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  const validate = () => {
    setError(null);
    if (!identifier) return "Email or Phone is required.";
    if (isRegistering) {
       if (!name) return "Name is required.";
       if (role === "student") {
         if (!age) return "Age is required.";
         if (!grade) return "Grade is required.";
       }
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

    // Pass all collected data
    onLogin({
        role,
        name: isRegistering ? name : (role === "admin" ? "Admin Volunteer" : "Alex Student"),
        age: isRegistering ? age : undefined,
        grade: isRegistering ? grade : undefined,
        school: isRegistering ? school : undefined,
        id: isRegistering ? undefined : (role === "admin" ? 'user-admin' : 'user-123') // Demo logic: use fixed ID for login, new ID for register
    });
  };

  const gradeOptions = [
      "Middle School (6-8)",
      "Freshman (9th)",
      "Sophomore (10th)",
      "Junior (11th)",
      "Senior (12th)",
      "College Freshman",
      "College Sophomore",
      "College Junior",
      "College Senior",
      "Graduate Student"
  ];

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-serif font-bold text-eggplant dark:text-white mb-2">
             {isRegistering ? "Join the Community" : "Welcome Back"}
           </h2>
           <p className="text-slate-500 text-sm">
             {isRegistering ? "Create your profile to start sharing." : "Log in to access your dashboard."}
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
          
          {/* Registration Fields */}
          {isRegistering && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name / Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
                        placeholder="How should we call you?"
                        />
                    </div>
                </div>

                {role === "student" && (
                    <>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input 
                                    type="number" 
                                    required 
                                    min="13" max="100"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
                                    placeholder="16"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Grade Level</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <select 
                                    required
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white appearance-none"
                                >
                                    <option value="">Select your grade</option>
                                    {gradeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">School (Optional)</label>
                            <div className="relative">
                                <School className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input 
                                type="text" 
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-eggplant outline-none transition-all dark:text-white"
                                placeholder="High School Name"
                                />
                            </div>
                        </div>
                    </>
                )}
             </div>
          )}

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