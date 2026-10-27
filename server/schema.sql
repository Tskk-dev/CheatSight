PRAGMA foreign_keys=ON;
CREATE TABLE sessions (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, title TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'test', form_url TEXT NOT NULL, meet_url TEXT,
 duration INTEGER NOT NULL, mouse INTEGER NOT NULL, created_at INTEGER NOT NULL, ended_at INTEGER
);
CREATE INDEX session_owner ON sessions(owner_id);
CREATE TABLE participants (
 id TEXT PRIMARY KEY,session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL,name TEXT NOT NULL,joined_at INTEGER NOT NULL,last_seen INTEGER NOT NULL,
 state TEXT NOT NULL,completed_at INTEGER,source TEXT NOT NULL DEFAULT 'page'
);
CREATE INDEX participant_session ON participants(session_id);
CREATE TABLE events (
 id TEXT PRIMARY KEY,participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
 session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,type TEXT NOT NULL,at INTEGER NOT NULL,value INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX event_session ON events(session_id,at);
