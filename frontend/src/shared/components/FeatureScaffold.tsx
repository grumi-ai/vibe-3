import type { ReactNode } from "react";

type Props = {
  badge: string;
  title: string;
  description: string;
  apiEndpoint: string;
  items: string[];
  children?: ReactNode;
};

export function FeatureScaffold({ badge, title, description, apiEndpoint, items, children }: Props) {
  return (
    <div className="featureGrid">
      <section className="featureCard">
        <p className="label">{badge}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <p className="apiHint">{apiEndpoint}</p>
        {children}
      </section>
      <section className="featureCard muted">
        <h3>구현 범위</h3>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
