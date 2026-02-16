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
  Monitor
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
    <div className="min-h-screen bg-white pb-20 font-sans text-gray-900 selection:bg-blue-50 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <PlacementBreadcrumbs
          items={[
            { label: "Dashboard", href: "/placement/student/dashboard" },
            { label: "My Profile" },
          ]}
        />

        <header className="mt-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black">
              Candidate Profile
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              Manage your professional identity and placement credentials.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full self-start md:self-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Profile Active
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Personal Info & Online Presence */}
          <div className="lg:col-span-4 space-y-8">
            {/* Identity Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm ring-1 ring-gray-100">
                  <UserCircle className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-black">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-500 text-sm font-medium mb-4">{user?.email}</p>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold tracking-wide">
                  ID: {user?.id_number}
                </div>
              </div>
            </div>

            {/* Online Presence Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Social Links
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-2 gap-2">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin_url}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-2 gap-2">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="https://github.com/..."
                    value={formData.github_url}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-500 mb-2 gap-2">
                    <Monitor className="w-3.5 h-3.5" /> Portfolio
                  </label>
                  <input
                    type="url"
                    name="portfolio_url"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Save Button (Desktop) */}
            <div className="hidden lg:block sticky top-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {loading ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Resume Section */}
            <section>
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                </div>
                Resume & Documents
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-2">
                <ResumeManager />
              </div>
            </section>

            {/* Skills Section */}
            <section className="bg-white">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-blue-600" />
                </div>
                Technical Competency
              </h3>

              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Technical Skills
                  </label>
                  <textarea
                    name="technical_skills"
                    rows="3"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm leading-relaxed text-gray-600 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="E.g. React.js, Node.js, MongoDB, AWS, Docker..."
                    value={formData.technical_skills}
                    onChange={handleChange}
                  ></textarea>
                  <p className="text-[10px] text-gray-400 font-medium mt-2 pl-1">
                    Separate skills with commas. These will be used for drive matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Programming Languages
                    </label>
                    <input
                      type="text"
                      name="programming_languages"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Python, Java, C++..."
                      value={formData.programming_languages}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Soft Skills
                    </label>
                    <input
                      type="text"
                      name="soft_skills"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Leadership, Communication..."
                      value={formData.soft_skills}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Achievements Section */}
            <section>
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                </div>
                Key Achievements
              </h3>
              <div className="bg-white border border-gray-100 rounded-2xl p-1 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                <textarea
                  name="achievements"
                  rows="6"
                  className="w-full p-6 text-sm leading-relaxed text-gray-600 bg-white rounded-xl outline-none resize-none placeholder:text-gray-300"
                  placeholder="• Won 1st place in National Hackathon 2024&#10;• Published research paper on AI..."
                  value={formData.achievements}
                  onChange={handleChange}
                ></textarea>
              </div>
            </section>

            {/* Mobile Save Button */}
            <div className="block lg:hidden pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg disabled:opacity-70"
              >
                {loading ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyPlacementProfile;
