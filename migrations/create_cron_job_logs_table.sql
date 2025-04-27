CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  items_processed INTEGER DEFAULT 0,
  details JSONB,
  error TEXT,
  manual BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS cron_job_logs_job_name_idx ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS cron_job_logs_started_at_idx ON cron_job_logs(started_at);
