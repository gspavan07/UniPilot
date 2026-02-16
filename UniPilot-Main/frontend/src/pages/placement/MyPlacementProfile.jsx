import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyProfile,
  updateMyProfile,
  fetchSystemFields,
} from "../../store/slices/placementSlice";
import {
  UserCircle,
  Code2,
  GraduationCap,
  Link as LinkIcon,
  Globe,
  Save,
  Github,
  Linkedin,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";
import ResumeManager from "./components/ResumeManager";

const MyPlacementProfile = () => {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector((state) => state.placement);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    technical_skills: "",
    soft_skills: "",
    programming_languages: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    achievements: "",
  });

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchSystemFields());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        technical_skills: myProfile.technical_skills?.join(", ") || "",
        soft_skills: myProfile.soft_skills?.join(", ") || "",
        programming_languages:
          myProfile.programming_languages?.join(", ") || "",
        linkedin_url: myProfile.linkedin_url || "",
        github_url: myProfile.github_url || "",
        portfolio_url: myProfile.portfolio_url || "",
        achievements: myProfile.achievements?.join("\n") || "",
      });
    }
  }, [myProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      technical_skills: formData.technical_skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      soft_skills: formData.soft_skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      programming_languages: formData.programming_languages
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      achievements: formData.achievements
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      await dispatch(updateMyProfile(payload)).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-50 selection:text-blue-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <PlacementBreadcrumbs
          items={[
            { label: "Dashboard", href: "/placement/student/dashboard" },

            { label: "Placement Profile" },
          ]}
        />

        <header className="mt-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                  Candidate Settings
                </span>
                <div className="h-px w-8 bg-gray-100"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
                Professional <span className="text-blue-600">Identity.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium max-w-2xl">
                Manage your skills, achievements, and professional links to
                attract top-tier recruiters.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                form="profile-form"
                disabled={loading}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                {loading ? "Syncing..." : "Save Profile"}
              </button>
            </div>
          </div>
        </header>

        <form
          id="profile-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          {/* Left Column: Personal Info & Socials */}
          <div className="lg:col-span-4 space-y-12">
            {/* Identity Card */}
            <div className="group relative p-8 rounded-[2.5rem] bg-gray-950 text-white overflow-hidden shadow-2xl shadow-blue-900/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <UserCircle className="w-14 h-14 text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-blue-400 font-bold text-sm mb-6">
                  {user?.email}
                </p>
                <div className="px-6 py-2 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  ID: {user?.student_id}
                </div>
              </div>
            </div>

            {/* Social Presence */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                <Globe className="w-4 h-4" />
                Social Connections
              </h3>

              <div className="space-y-4">
                {[
                  {
                    name: "linkedin_url",
                    label: "LinkedIn",
                    icon: Linkedin,
                    placeholder: "linkedin.com/in/username",
                  },
                  {
                    name: "github_url",
                    label: "GitHub",
                    icon: Github,
                    placeholder: "github.com/username",
                  },
                  {
                    name: "portfolio_url",
                    label: "Portfolio",
                    icon: Monitor,
                    placeholder: "yourportfolio.me",
                  },
                ].map((social) => (
                  <div key={social.name} className="group flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                      {social.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                        <social.icon className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        name={social.name}
                        placeholder={social.placeholder}
                        value={formData[social.name]}
                        onChange={handleChange}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Skills & Accomplishments */}
          <div className="lg:col-span-8 space-y-16">
            {/* Resume Management */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                <LinkIcon className="w-4 h-4" />
                Strategic Assets
              </h3>
              <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-2 hover:border-blue-200 transition-colors">
                <ResumeManager />
              </div>
            </section>

            {/* Technical DNA */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    Technical Infrastructure
                  </h2>
                  <p className="text-sm text-gray-400 font-medium pl-4">
                    Core competencies and specializations
                  </p>
                </div>
                <Code2 className="w-8 h-8 text-gray-100" />
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    Primary Stack & Technologies
                  </label>
                  <textarea
                    name="technical_skills"
                    rows="4"
                    placeholder="E.g. React Native, PostgreSQL, Kubernetes, Terraform..."
                    value={formData.technical_skills}
                    onChange={handleChange}
                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold leading-relaxed text-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300 resize-none"
                  ></textarea>
                  <div className="flex items-center gap-2 px-4 text-[10px] font-bold text-gray-400">
                    <AlertCircle className="w-3 h-3" />
                    Separate skills with commas for optimized drive matching.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      Programming Languages
                    </label>
                    <input
                      type="text"
                      name="programming_languages"
                      placeholder="Go, Rust, TypeScript..."
                      value={formData.programming_languages}
                      onChange={handleChange}
                      className="w-full px-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                      Executive & Soft Skills
                    </label>
                    <input
                      type="text"
                      name="soft_skills"
                      placeholder="Strategic Thinking, Agile..."
                      value={formData.soft_skills}
                      onChange={handleChange}
                      className="w-full px-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Career Milestones */}
            <section className="space-y-8 pb-12">
              <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                    Professional Milestones
                  </h2>
                  <p className="text-sm text-gray-400 font-medium pl-4">
                    Significant achievements and project history
                  </p>
                </div>
                <GraduationCap className="w-8 h-8 text-gray-100" />
              </div>

              <div className="group relative">
                <div className="absolute top-6 left-6 text-emerald-600/20 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <textarea
                  name="achievements"
                  rows="8"
                  placeholder="• Automated CI/CD pipelines reducing deployment time by 40%&#10;• Led a team of 5 in Global Hackathon series&#10;• Certified AWS Solutions Architect..."
                  value={formData.achievements}
                  onChange={handleChange}
                  className="w-full pl-16 pr-8 py-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-sm font-bold font-mono leading-relaxed text-black focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300 resize-none shadow-sm"
                ></textarea>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyPlacementProfile;
