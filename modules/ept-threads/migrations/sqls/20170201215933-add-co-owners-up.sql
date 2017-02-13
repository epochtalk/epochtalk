CREATE TABLE thread_owners_mapping (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id uuid REFERENCES threads (id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);