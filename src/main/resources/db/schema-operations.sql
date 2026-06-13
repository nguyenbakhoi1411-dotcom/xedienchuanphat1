create table if not exists system_error_logs (
    id bigserial primary key,
    severity varchar(20) not null,
    module varchar(80) not null,
    error_type varchar(180) not null,
    message varchar(1000) not null,
    path varchar(1000),
    username varchar(80),
    stack_trace varchar(4000),
    created_at timestamp with time zone not null default now()
);

create index if not exists idx_system_error_logs_time_module
    on system_error_logs(created_at, module, severity);
