-- Agents: seed/reference data, no CRUD endpoints
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Tickets: the core entity
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT NOT NULL UNIQUE,     -- e.g. INC-1001
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Network','Application','Hardware','Software','Access/Login','Email','VPN')),
    priority TEXT NOT NULL CHECK (priority IN ('Critical','High','Medium','Low')),
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Pending','Resolved','Closed')),
    assigned_agent_id INTEGER,
    created_at TEXT NOT NULL,
    sla_due_at TEXT NOT NULL,
    resolved_at TEXT,
    resolution_notes TEXT,
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(id)
);

-- Comments / work notes on a ticket
CREATE TABLE IF NOT EXISTS ticket_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Knowledge base: independent reference data
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    problem TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    info_to_collect TEXT NOT NULL,
    troubleshooting_steps TEXT NOT NULL,
    resolution TEXT NOT NULL,
    escalate_when TEXT NOT NULL
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON ticket_comments(ticket_id);