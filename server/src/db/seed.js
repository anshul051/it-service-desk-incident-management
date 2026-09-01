import db from '../config/database.js';

console.log('Seeding database...');

// ---------- Clear existing data (safe to re-run) ----------
db.exec(`
    DELETE FROM ticket_comments;
    DELETE FROM tickets;
    DELETE FROM knowledge_articles;
    DELETE FROM agents;
    DELETE FROM sqlite_sequence WHERE name IN ('ticket_comments', 'tickets', 'knowledge_articles', 'agents');
`);

// ---------- Agents ----------
const insertAgent = db.prepare(`
    INSERT INTO agents (name, email) VALUES (?, ?)
`);

const agents = [
    { name: 'Rahul', email: 'rahul@servicedesk.local' },
    { name: 'Priya', email: 'priya@servicedesk.local' },
    { name: 'Amit', email: 'amit@servicedesk.local' },
    { name: 'Neha', email: 'neha@servicedesk.local' }
];

const agentIds = {};
for (const agent of agents) {
    const result = insertAgent.run(agent.name, agent.email);
    agentIds[agent.name] = result.lastInsertRowid;
}
console.log(`Inserted ${agents.length} agents`);

// ---------- Knowledge Base Articles ----------
const insertArticle = db.prepare(`
    INSERT INTO knowledge_articles
        (title, category, problem, symptoms, info_to_collect, troubleshooting_steps, resolution, escalate_when)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const articles = [
    {
        title: 'VPN not connecting',
        category: 'VPN',
        problem: 'User is unable to establish a VPN connection to the corporate network.',
        symptoms: 'Connection timeout, authentication failure, or client stuck on "Connecting".',
        info_to_collect: 'VPN client version, error message/code, network type (home/office/mobile), time issue started.',
        troubleshooting_steps: '1. Verify internet connectivity works outside VPN.\n2. Check VPN credentials are correct and not expired.\n3. Check VPN client is running and up to date.\n4. Restart the VPN client.\n5. Check the exact error message shown.\n6. Verify system date/time is correct (certificate issues can occur if clock is wrong).\n7. Retry the connection.\n8. Ask if other users are experiencing the same issue.',
        resolution: 'Most VPN issues resolve after restarting the client or correcting credentials/system time.',
        escalate_when: 'Multiple users are affected, or the VPN gateway/server itself appears down — escalate to Network/Infrastructure team.'
    },
    {
        title: 'No internet connection',
        category: 'Network',
        problem: 'User reports no internet access on their machine.',
        symptoms: 'Browser shows "no internet", pages fail to load, Wi-Fi/Ethernet icon shows disconnected or limited.',
        info_to_collect: 'Connection type (Wi-Fi/wired), whether other devices on same network are affected, any recent network changes.',
        troubleshooting_steps: '1. Check physical cable connection or Wi-Fi is enabled.\n2. Restart the network adapter or toggle Wi-Fi off/on.\n3. Run basic connectivity test (ping a known site).\n4. Restart the router/modem if user-controlled.\n5. Check if other devices on the same network are affected.\n6. Release/renew IP configuration if applicable.',
        resolution: 'Typically resolved via adapter restart or router restart.',
        escalate_when: 'Entire office/floor affected, or issue persists after basic troubleshooting — escalate to Network team.'
    },
    {
        title: 'Windows login issue',
        category: 'Access/Login',
        problem: 'User cannot log into their Windows machine.',
        symptoms: 'Incorrect password message despite correct credentials, account locked, or login hangs.',
        info_to_collect: 'Exact error message, username, whether the account was recently reset or is new, last successful login time.',
        troubleshooting_steps: '1. Confirm username is entered correctly.\n2. Confirm Caps Lock/keyboard layout is not affecting password entry.\n3. Check if the account is locked out.\n4. Verify the account has not expired or been disabled.\n5. Attempt login with a known-good test account if available.\n6. Check for recent password reset that user may not have applied.',
        resolution: 'Often resolved via password reset or unlocking the account.',
        escalate_when: 'Account appears disabled at the directory level, or issue affects domain-wide authentication — escalate to Identity/Access team.'
    },
    {
        title: 'Password/account issue',
        category: 'Access/Login',
        problem: 'User has forgotten their password or their account has issues (locked, expired).',
        symptoms: 'Repeated authentication failures, account lockout messages, expired password prompts.',
        info_to_collect: 'Username, application/system affected, last known successful login, number of failed attempts.',
        troubleshooting_steps: '1. Verify identity per standard process before any reset.\n2. Check account lockout/expiry status.\n3. Perform password reset if authorized.\n4. Confirm password policy requirements are met.\n5. Have user attempt login with new credentials.\n6. Confirm account is not disabled.',
        resolution: 'Resolved via password reset and confirming successful login.',
        escalate_when: 'Identity cannot be verified, or account shows signs of compromise — escalate to Security/Identity team.'
    },
    {
        title: 'Application not opening',
        category: 'Application',
        problem: 'An application fails to launch or open for the user.',
        symptoms: 'No response when clicking icon, error dialog on launch, application hangs on splash screen.',
        info_to_collect: 'Application name and version, error message, when it last worked, recent updates/changes to the machine.',
        troubleshooting_steps: '1. Confirm the application is installed correctly.\n2. Restart the application.\n3. Restart the machine.\n4. Check for pending updates to the application.\n5. Check available disk space and system resources.\n6. Review any error logs or dialogs shown.',
        resolution: 'Frequently resolved by restart or reinstall of the application.',
        escalate_when: 'Application fails for multiple users, or issue points to a server-side/licensing problem — escalate to Application Support team.'
    },
    {
        title: 'Application crashing',
        category: 'Application',
        problem: 'An application opens but crashes intermittently or consistently during use.',
        symptoms: 'Application closes unexpectedly, error dialog appears, "Not Responding" state.',
        info_to_collect: 'Application version, steps to reproduce, frequency of crash, error message/crash log if available.',
        troubleshooting_steps: '1. Note the exact action being performed when it crashes.\n2. Restart the application and attempt to reproduce.\n3. Check for available application updates.\n4. Check system resource usage (memory/CPU).\n5. Review crash logs if accessible.\n6. Determine if the crash is reproducible or intermittent.',
        resolution: 'Often resolved by updating the application or freeing system resources.',
        escalate_when: 'Crash is reproducible and affects multiple users, or a known bug is suspected — escalate to Application Support/Development team.'
    },
    {
        title: 'Outlook/email problem',
        category: 'Email',
        problem: 'User is experiencing issues sending, receiving, or accessing email in Outlook.',
        symptoms: 'Emails stuck in outbox, not receiving new mail, Outlook shows "disconnected" status.',
        info_to_collect: 'Error message, whether webmail works as an alternative, time issue started, mailbox size/storage warnings.',
        troubleshooting_steps: '1. Check internet connectivity.\n2. Check Outlook connection status (bottom status bar).\n3. Restart Outlook.\n4. Verify account credentials are current.\n5. Check mailbox storage limits.\n6. Test access via webmail to isolate client vs server issue.',
        resolution: 'Usually resolved by restarting Outlook or reconnecting the account.',
        escalate_when: 'Webmail also fails, or issue affects multiple users — escalate to Email/Infrastructure team.'
    },
    {
        title: 'Printer issue',
        category: 'Hardware',
        problem: 'User is unable to print or is experiencing printer errors.',
        symptoms: 'Print jobs stuck in queue, printer offline, paper jam or hardware error shown.',
        info_to_collect: 'Printer name/location, error message, whether other users can print to the same printer.',
        troubleshooting_steps: '1. Check printer is powered on and connected to the network.\n2. Check for paper jams or hardware error lights.\n3. Clear stuck print jobs from the queue.\n4. Restart the print spooler service.\n5. Confirm the correct printer is selected as default.\n6. Test printing a simple test page.',
        resolution: 'Commonly resolved by clearing the queue or restarting the spooler.',
        escalate_when: 'Hardware fault suspected, or printer is unreachable for all users — escalate to Hardware/Facilities team.'
    }
];

for (const article of articles) {
    insertArticle.run(
        article.title,
        article.category,
        article.problem,
        article.symptoms,
        article.info_to_collect,
        article.troubleshooting_steps,
        article.resolution,
        article.escalate_when
    );
}
console.log(`Inserted ${articles.length} knowledge base articles`);

// ---------- Example Tickets ----------

// Simple SLA duration map (minutes) — formal slaService.js comes in Step 3
const SLA_MINUTES = {
    Critical: 15,
    High: 30,
    Medium: 120,
    Low: 480
};

function minutesAgo(mins) {
    return new Date(Date.now() - mins * 60 * 1000).toISOString();
}

function addMinutes(isoString, mins) {
    return new Date(new Date(isoString).getTime() + mins * 60 * 1000).toISOString();
}

const insertTicket = db.prepare(`
    INSERT INTO tickets
        (ticket_number, title, description, category, priority, status,
         assigned_agent_id, created_at, sla_due_at, resolved_at, resolution_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let ticketCounter = 1001;
function nextTicketNumber() {
    return `INC-${ticketCounter++}`;
}

const exampleTickets = [
    // 1. Open, High priority, VPN — created recently, well within SLA
    {
        title: 'User cannot connect to VPN',
        description: 'User reports VPN client stuck on "Connecting" from home network.',
        category: 'VPN',
        priority: 'High',
        status: 'Open',
        agent: 'Rahul',
        createdMinsAgo: 5,
        resolvedMinsAfterCreate: null,
        resolution_notes: null
    },
    // 2. In Progress, Medium, Application crashing
    {
        title: 'Application repeatedly crashes',
        description: 'Reporting app crashes every time user opens a large report.',
        category: 'Application',
        priority: 'Medium',
        status: 'In Progress',
        agent: 'Priya',
        createdMinsAgo: 40,
        resolvedMinsAfterCreate: null,
        resolution_notes: null
    },
    // 3. Resolved, High, Access/Login — resolved well within SLA
    {
        title: 'User cannot log into Windows',
        description: 'User locked out after multiple failed password attempts.',
        category: 'Access/Login',
        priority: 'High',
        status: 'Resolved',
        agent: 'Amit',
        createdMinsAgo: 60,
        resolvedMinsAfterCreate: 20,
        resolution_notes: 'Unlocked account and reset password. User confirmed successful login.'
    },
    // 4. Open, Critical, Application — multiple users affected (escalation scenario)
    {
        title: 'Multiple users cannot access finance application',
        description: 'Several users across the finance team report the application is unreachable.',
        category: 'Application',
        priority: 'Critical',
        status: 'Open',
        agent: 'Neha',
        createdMinsAgo: 10,
        resolvedMinsAfterCreate: null,
        resolution_notes: null
    },
    // 5. Open, Medium, Network — SLA APPROACHING (created a while ago, close to due time)
    {
        title: 'No internet connection in meeting room B',
        description: 'Wi-Fi drops intermittently in meeting room B.',
        category: 'Network',
        priority: 'Medium',
        status: 'Open',
        agent: 'Rahul',
        createdMinsAgo: 105, // SLA is 120 min → 15 min left → within the 20% "approaching" window
        resolvedMinsAfterCreate: null,
        resolution_notes: null
    },
    // 6. Open, High, Email — SLA BREACHED (created well past the 30 min SLA)
    {
        title: 'Outlook not sending emails',
        description: 'User can receive but not send emails since this morning.',
        category: 'Email',
        priority: 'High',
        status: 'Open',
        agent: 'Priya',
        createdMinsAgo: 90, // SLA is 30 min → already breached
        resolvedMinsAfterCreate: null,
        resolution_notes: null
    },
    // 7. Closed, Low, Hardware — resolved and closed cleanly within SLA
    {
        title: 'Printer unavailable on 3rd floor',
        description: 'Printer showing offline status, users unable to print.',
        category: 'Hardware',
        priority: 'Low',
        status: 'Closed',
        agent: 'Amit',
        createdMinsAgo: 300,
        resolvedMinsAfterCreate: 60,
        resolution_notes: 'Restarted print spooler service and cleared stuck queue. Test page printed successfully.'
    }
];

for (const t of exampleTickets) {
    const ticketNumber = nextTicketNumber();
    const createdAt = minutesAgo(t.createdMinsAgo);
    const slaDueAt = addMinutes(createdAt, SLA_MINUTES[t.priority]);
    const resolvedAt = t.resolvedMinsAfterCreate !== null
        ? addMinutes(createdAt, t.resolvedMinsAfterCreate)
        : null;

    insertTicket.run(
        ticketNumber,
        t.title,
        t.description,
        t.category,
        t.priority,
        t.status,
        agentIds[t.agent],
        createdAt,
        slaDueAt,
        resolvedAt,
        t.resolution_notes
    );
}
console.log(`Inserted ${exampleTickets.length} example tickets`);

console.log('Seeding complete.');