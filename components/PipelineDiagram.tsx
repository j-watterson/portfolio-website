export default function PipelineDiagram({ compact = false }: { compact?: boolean }) {
  const nodes = [
    { step: "01", title: "Ingest", sub: "Python ETL" },
    { step: "02", title: "Model", sub: "BigQuery + dbt" },
    { step: "03", title: "Orchestrate", sub: "Airflow" },
    { step: "04", title: "Consume", sub: "Trusted BI" },
  ];
  return (
    <div className={compact ? "pipeline compact" : "pipeline"} role="img" aria-label="Northwind data platform: ingest, model, orchestrate, consume">
      {nodes.map((node, index) => (
        <div className="pipeline-segment" key={node.step}>
          <div className="pipeline-node">
            <span className="mono">{node.step}</span>
            <strong>{node.title}</strong>
            <small>{node.sub}</small>
          </div>
          {index < nodes.length - 1 && <div className="pipeline-connector" aria-hidden="true"><i /></div>}
        </div>
      ))}
    </div>
  );
}

