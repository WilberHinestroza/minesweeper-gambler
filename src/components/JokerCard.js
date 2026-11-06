export default function JokerCard({
  joker,
  onClick,
  disabled = false,
  footer,
  actionLabel,
  className = '',
}) {
  const classes = ['joker-card', className].filter(Boolean).join(' ');
  const style = { '--joker-color': joker.color };
  const label = `${actionLabel ?? 'Comodín'}: ${joker.name}. ${
    joker.description
  }`;

  const content = (
    <>
      <span className="joker-symbol" aria-hidden="true">
        {joker.symbol}
      </span>
      <span className="joker-name">{joker.name}</span>
      <span className="joker-desc">{joker.description}</span>
      {footer ? <span className="joker-footer">{footer}</span> : null}
    </>
  );

  if (!onClick) {
    return (
      <div className={classes} style={style} title={label} aria-label={label}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {content}
    </button>
  );
}
