export type TextareaProps = {
  rows?: number;
  name?: string;
  error?: string;
  label?: string;
  value?: string;
  touched?: boolean;
  className?: string;
  required?: boolean;
  placeholder?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};
