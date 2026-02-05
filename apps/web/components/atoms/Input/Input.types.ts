export type InputProps = {
  name?: string;
  type?: string;
  label?: string;
  error?: string;
  value?: string;
  touched?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
