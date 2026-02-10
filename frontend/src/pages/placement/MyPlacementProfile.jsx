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
  FilePlus,
  Pencil,
  Globe,
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
    <div className="p-6 max-w-5xl mx-auto">
      <PlacementBreadcrumbs
        items={[
          { label: "Dashboard", href: "/placement/student/dashboard" },
          { label: "My Profile" },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Placement Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Showcase your skills and achievements to recruiters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info (Read-only) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-sm mt-2 inline-block">
                {user?.id_number}
              </p>
            </div>
          </div>
        </div>

        {/* Master Resume Manager */}
        <ResumeManager />

        {/* Skills & Experience */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Code2 className="w-6 h-6 mr-2 text-indigo-600" />
            Skills & Proficiency
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Technical Skills (Comma separated)
              </label>
              <textarea
                name="technical_skills"
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. React, Node.js, SQL, AWS, Docker"
                value={formData.technical_skills}
                onChange={handleChange}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Programming Languages
              </label>
              <input
                type="text"
                name="programming_languages"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Python, JS, C++"
                value={formData.programming_languages}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Soft Skills
              </label>
              <input
                type="text"
                name="soft_skills"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Communication, Leadership"
                value={formData.soft_skills}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <LinkIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Online Presence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin_url"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                name="github_url"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="https://github.com/..."
                value={formData.github_url}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Portfolio URL
              </label>
              <input
                type="url"
                name="portfolio_url"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="https://..."
                value={formData.portfolio_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-indigo-600" />
            Achievements
          </h3>
          <textarea
            name="achievements"
            rows="4"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="List your key achievements, hackathons, or rewards..."
            value={formData.achievements}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="flex justify-end p-4">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyPlacementProfile;
