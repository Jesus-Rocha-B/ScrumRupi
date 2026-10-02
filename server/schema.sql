CREATE TABLE IF NOT EXISTS workspace_meta (
  id TINYINT PRIMARY KEY,
  version BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(24) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  initials VARCHAR(8) NOT NULL,
  color VARCHAR(24) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_stories (
  id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  epic VARCHAR(160) NOT NULL,
  assignee_id VARCHAR(24) NULL,
  status VARCHAR(32) NOT NULL,
  progress TINYINT UNSIGNED NOT NULL,
  priority VARCHAR(24) NOT NULL,
  CONSTRAINT fk_story_member FOREIGN KEY (assignee_id) REFERENCES team_members(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS story_tasks (
  id VARCHAR(64) PRIMARY KEY,
  story_id VARCHAR(32) NOT NULL,
  title VARCHAR(500) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  position INT NOT NULL,
  CONSTRAINT fk_task_story FOREIGN KEY (story_id) REFERENCES user_stories(id) ON DELETE CASCADE,
  INDEX idx_task_story (story_id, position)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(80) NOT NULL,
  starts_at DATETIME(3) NOT NULL,
  meet_url VARCHAR(2048) NOT NULL,
  agenda TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meeting_attendees (
  meeting_id VARCHAR(64) NOT NULL,
  member_id VARCHAR(24) NOT NULL,
  PRIMARY KEY (meeting_id, member_id),
  CONSTRAINT fk_attendee_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendee_member FOREIGN KEY (member_id) REFERENCES team_members(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sprints (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  goal TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sprint_stories (
  sprint_id VARCHAR(64) NOT NULL,
  story_id VARCHAR(32) NOT NULL,
  PRIMARY KEY (sprint_id, story_id),
  CONSTRAINT fk_sprint_story_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
  CONSTRAINT fk_sprint_story_story FOREIGN KEY (story_id) REFERENCES user_stories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS work_updates (
  id VARCHAR(64) PRIMARY KEY,
  member_id VARCHAR(24) NOT NULL,
  story_id VARCHAR(32) NOT NULL,
  note TEXT NOT NULL,
  progress TINYINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_update_member FOREIGN KEY (member_id) REFERENCES team_members(id),
  CONSTRAINT fk_update_story FOREIGN KEY (story_id) REFERENCES user_stories(id),
  INDEX idx_update_created (created_at)
) ENGINE=InnoDB;
