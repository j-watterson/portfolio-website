export default function ProjectFlow({ steps }: { steps: string[] }) {
  return (
    <div className="project-flow" role="img" aria-label={`Data flow: ${steps.join(" to ")}`}>
      {steps.map((step, index) => (
        <div className="flow-item" key={step}>
          <span className="mono">{String(index + 1).padStart(2, "0")}</span>
          <strong>{step}</strong>
          {index < steps.length - 1 && <i aria-hidden="true">→</i>}
        </div>
      ))}
    </div>
  );
}

