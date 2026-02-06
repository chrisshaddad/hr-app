export type ButtonProps = {
  text: string;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
};
