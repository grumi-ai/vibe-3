create table if not exists health_checks (
  id integer primary key autoincrement,
  status text not null,
  checked_at datetime not null default current_timestamp
);

create table if not exists members (
  id integer primary key autoincrement,
  name text not null,
  department text,
  role text,
  created_at datetime not null default current_timestamp
);

create table if not exists schedules (
  id integer primary key autoincrement,
  member_id integer,
  title text not null,
  schedule_type text not null,
  starts_at datetime not null,
  ends_at datetime not null,
  location text,
  memo text,
  foreign key (member_id) references members(id)
);

create table if not exists complaint_manuals (
  id integer primary key autoincrement,
  filename text not null,
  content_text text,
  uploaded_at datetime not null default current_timestamp
);

create table if not exists complaint_chat_logs (
  id integer primary key autoincrement,
  question text not null,
  answer text not null,
  created_at datetime not null default current_timestamp
);

create table if not exists news_articles (
  id integer primary key autoincrement,
  title text not null,
  source text,
  url text unique,
  summary text,
  keyword text,
  published_at datetime,
  collected_at datetime not null default current_timestamp
);
