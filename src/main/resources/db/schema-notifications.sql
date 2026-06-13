create table if not exists notifications (
    id bigserial primary key,
    title varchar(180) not null,
    message varchar(1000) not null,
    type varchar(80) not null,
    severity varchar(20) not null,
    module varchar(80) not null,
    entity_id bigint,
    created_at timestamp with time zone not null default now(),
    constraint uk_notifications_type_module_entity unique (type, module, entity_id)
);

create table if not exists notification_recipients (
    id bigserial primary key,
    notification_id bigint not null references notifications(id) on delete cascade,
    username varchar(80) not null,
    read_at timestamp with time zone,
    constraint uk_notification_recipients_notification_user unique (notification_id, username)
);

create index if not exists idx_notification_recipients_user_read
    on notification_recipients(username, read_at);

create table if not exists reminders (
    id bigserial primary key,
    reminder_date date not null,
    customer_id bigint,
    assigned_to bigint,
    type varchar(40) not null,
    status varchar(20) not null,
    title varchar(180) not null,
    note varchar(1000),
    created_at timestamp with time zone not null default now(),
    done_at timestamp with time zone
);

create index if not exists idx_reminders_assignee_status_date
    on reminders(assigned_to, status, reminder_date);

create index if not exists idx_reminders_customer_date
    on reminders(customer_id, reminder_date);
