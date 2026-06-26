import { platformCards } from "../data";

export function PlatformStrip() {
  return (
    <div className="platform-strip" aria-label="Platform summary">
      {platformCards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="platform-card" key={card.label}>
            <Icon size={18} />
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

