export type SideModalProps = {
  open: boolean;
  width?: string;
  className?: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
};
