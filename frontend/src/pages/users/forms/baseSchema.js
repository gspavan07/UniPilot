import * as yup from "yup";

export const baseUserSchema = {
  first_name: yup
    .string()
    .min(2, "Min 2 characters")
    .required("First name is required"),
  last_name: yup
    .string()
    .min(1, "Last name is required")
    .required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().optional(),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"])
    .required("Gender is required"),
  date_of_birth: yup.string().optional(),
  department_id: yup.string().required("Department is required"),
  is_active: yup.boolean().default(true),
  religion: yup.string().optional(),
  caste: yup.string().optional(),
  nationality: yup.string().default("Indian"),
  aadhaar_number: yup
    .string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  passport_number: yup
    .string()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),
};

export const baseDefaultValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  gender: "Other",
  date_of_birth: "",
  department_id: "",
  is_active: true,
  religion: "",
  caste: "",
  nationality: "Indian",
  aadhaar_number: "",
  passport_number: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  bank_details: {
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    holder_name: "",
  },
  custom_fields: {},
};
