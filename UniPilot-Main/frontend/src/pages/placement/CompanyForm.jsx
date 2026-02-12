import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createCompany,
  updateCompany,
  fetchCompanies,
} from "../../store/slices/placementSlice";
import {
  Building2,
  MapPin,
  Globe,
  ChevronLeft,
  Image,
  User,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";
import PlacementBreadcrumbs from "./components/PlacementBreadcrumbs";
import toast from "react-hot-toast";

const CompanyForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { companies } = useSelector((state) => state.placement);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    company_tier: "regular",
    description: "",
    logo_url: "",
    primary_contact_name: "",
    primary_contact_designation: "",
    primary_contact_email: "",
    primary_contact_phone: "",
  });

  useEffect(() => {
    if (isEdit && companies.length > 0) {
      const company = companies.find((c) => c.id === id);
      if (company) {
        setFormData({
          name: company.name || "",
          industry: company.industry || "",
          location: company.location || "",
          website: company.website || "",
          company_tier: company.company_tier || "regular",
          description: company.description || "",
          logo_url: company.logo_url || "",
          primary_contact_name: company.contacts?.[0]?.name || "",
          primary_contact_designation: company.contacts?.[0]?.designation || "",
          primary_contact_email: company.contacts?.[0]?.email || "",
          primary_contact_phone: company.contacts?.[0]?.phone || "",
        });
      }
    } else if (isEdit) {
      dispatch(fetchCompanies());
    }
  }, [isEdit, id, companies, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      contacts: [
        {
          name: formData.primary_contact_name,
          designation: formData.primary_contact_designation,
          email: formData.primary_contact_email,
          phone: formData.primary_contact_phone,
          is_primary: true,
          id: isEdit
            ? companies.find((c) => c.id === id)?.contacts?.[0]?.id
            : undefined,
        },
      ],
    };

    try {
      if (isEdit) {
        await dispatch(updateCompany({ id, data: payload })).unwrap();
        toast.success("Company updated successfully");
      } else {
        await dispatch(createCompany(payload)).unwrap();
        toast.success("Company added successfully");
      }
      navigate("/placement/companies");
    } catch (error) {
      toast.error(error.error || "Failed to save company");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PlacementBreadcrumbs
        items={[
          { label: "Companies", href: "/placement/companies" },
          { label: isEdit ? "Edit Company" : "Add Company" },
        ]}
      />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Company Profile" : "Add New Company"}
          </h1>
          <p className="text-gray-500 mt-1">
            Provide information about the recruitment partner
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. Google India"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. Software, Core Engineering"
                value={formData.industry}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Company Tier
              </label>
              <select
                name="company_tier"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.company_tier}
                onChange={handleChange}
              >
                <option value="regular">Regular</option>
                <option value="dream">Dream</option>
                <option value="super_dream">Super Dream</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Hyderabad, Bangalore"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Logo URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="logo_url"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Direct image URL for company logo"
                  value={formData.logo_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                About Company
              </label>
              <textarea
                name="description"
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Brief description of the company..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* HR Contact Section */}
            <div className="md:col-span-2 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Primary HR Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Contact Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="primary_contact_name"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="HR Name"
                      value={formData.primary_contact_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="primary_contact_designation"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Talent Acquisition"
                      value={formData.primary_contact_designation}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="primary_contact_email"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="hr@company.com"
                      value={formData.primary_contact_email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="primary_contact_phone"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="+91..."
                      value={formData.primary_contact_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white dark:bg-gray-750 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              {isEdit ? "Update Company" : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
