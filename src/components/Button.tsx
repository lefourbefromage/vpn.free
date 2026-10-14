import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'white' | 'discord' | 'text';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Icon-only square button. Requires aria-label. */
  square?: boolean;
}

function cls({ variant = 'primary', size = 'md', block, square }: StyleProps, extra?: string) {
  return [styles.btn, styles[variant], styles[size], block && styles.block, square && styles.square, extra]
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, square, className, type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={cls({ variant, size, block, square }, className)} {...rest} />;
});

type ButtonLinkProps = StyleProps & LinkProps;

export function ButtonLink({ variant, size, block, square, className, ...rest }: ButtonLinkProps) {
  return <Link className={cls({ variant, size, block, square }, className)} {...rest} />;
}

/** Plain anchor (external or placeholder links) with button styling. */
export function ButtonAnchor({
  variant,
  size,
  block,
  square,
  className,
  ...rest
}: StyleProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cls({ variant, size, block, square }, className)} {...rest} />;
}
