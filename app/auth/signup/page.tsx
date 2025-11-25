"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    universityRollNumber: "",
    section: "",
    classRollNumber: "",
    branch: "",
    course: "",
    leetcodeId: "",
    githubId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-300/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-lg placeholder:text-muted-foreground/60 text-base px-4 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("All required fields must be filled.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "student",
          profile: {
            collegeName: formData.collegeName,
            universityRollNumber: formData.universityRollNumber,
            section: formData.section,
            classRollNumber: formData.classRollNumber,
            branch: formData.branch,
            course: formData.course,
            leetcodeId: formData.leetcodeId,
            githubId: formData.githubId,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      setSuccess("Account created! Redirecting...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-gradient-to-br from-blue-400/40 via-indigo-300/40 to-purple-300/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">

      {/* LEFT BEAUTIFUL HEADER */}
      <div className="hidden lg:flex flex-col justify-center pr-16">
        <h1 className="text-6xl font-extrabold bg-gradient-to-br from-blue-700 to-indigo-500 bg-clip-text text-transparent tracking-tight">
          Welcome 👋
        </h1>
        <p className="text-lg mt-4 text-slate-600 dark:text-slate-300 max-w-sm">
          Create your EduLearn account and start your smart learning journey.
        </p>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full max-w-4xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-white/30">

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Fill the form below to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* GRID FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {[
              ["firstName", "First Name *"],
              ["lastName", "Last Name *"],
              ["email", "Email *"],
              ["collegeName", "College *"],
              ["universityRollNumber", "University Roll No *"],
              ["section", "Section *"],
              ["classRollNumber", "Class Roll No *"],
              ["branch", "Branch *"],
              ["course", "Course *"],
              ["leetcodeId", "LeetCode ID"],
              ["githubId", "GitHub ID"],
            ].map(([name, label]) => (
              <div key={name} className="flex flex-col space-y-2">
                <Label htmlFor={name} className="font-medium text-slate-700 dark:text-slate-200">
                  {label}
                </Label>
                <Input
                  id={name}
                  name={name}
                  type="text"
                  className={inputClass}
                  placeholder={label}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            ))}

            {/* PASSWORD */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className={inputClass}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={inputClass}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* ERROR/SUCCESS */}
          {error && (
            <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
