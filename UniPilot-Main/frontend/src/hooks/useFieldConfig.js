import { useMemo } from "react";
import { useSelector } from "react-redux";

/**
 * useFieldConfig Hook
 * Helps specialized forms determine field visibility and requirements
 * based on the role's field_config.
 */
export const useFieldConfig = (roleSlug) => {
  const { roles } = useSelector((state) => state.roles);

  const config = useMemo(() => {
    const role = roles.find((r) => r.slug === roleSlug);
    return role?.field_config || {};
  }, [roles, roleSlug]);

  /**
   * isVisible(fieldKey)
   * Returns true unless explicitly set to visible: false
   */
  const isVisible = (fieldKey) => {
    return config[fieldKey]?.visible !== false;
  };

  /**
   * isRequired(fieldKey)
   * Returns true if explicitly set to required: true
   */
  const isRequired = (fieldKey) => {
    return config[fieldKey]?.required === true;
  };

  /**
   * getValidation(fieldKey, baseSchema)
   * Returns the schema for the field, adjusting for requirement if necessary
   */
  const applyConfig = (fieldKey, label) => {
    const visible = isVisible(fieldKey);
    const required = isRequired(fieldKey);
    return { visible, required, label: required ? `${label} *` : label };
  };

  return { config, isVisible, isRequired, applyConfig };
};

export default useFieldConfig;
