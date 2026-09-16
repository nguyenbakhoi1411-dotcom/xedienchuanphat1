CREATE TABLE IF NOT EXISTS report_export_snapshots (
    id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(80) NOT NULL,
    format VARCHAR(30) NOT NULL,
    from_date DATE,
    to_date DATE,
    parameters_json TEXT NOT NULL,
    data_json TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    exported_by VARCHAR(120) NOT NULL,
    exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_export_snapshots_type_date
    ON report_export_snapshots(report_type, from_date, to_date);

CREATE INDEX IF NOT EXISTS idx_report_export_snapshots_exported_at
    ON report_export_snapshots(exported_at DESC);
