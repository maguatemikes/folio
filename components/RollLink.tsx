type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { label: string };

/** Link whose label rolls up to a duplicate on hover. */
export default function RollLink({ label, className = "", ...rest }: Props) {
  return (
    <a className={`link ${className}`} {...rest}>
      <span data-text={label}>{label}</span>
    </a>
  );
}
