export type DropdownItem = {
  label: string;
  value: string;
};

export type DropdownProps = {
  value: string;
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  className?: string;
  placeholder: string;
  onBlur?: () => void;
  items: DropdownItem[];
  align?: 'start' | 'center' | 'end';
  onChange: (value: string) => void;
};
