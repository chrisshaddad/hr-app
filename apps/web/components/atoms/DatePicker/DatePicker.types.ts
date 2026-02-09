export type DatePickerProps = {
  label?: string;
  value?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  className?: string;
  onBlur?: () => void;
  placeholder?: string;
  onChange?: (value: string) => void;
};
