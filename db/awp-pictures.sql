drop table if exists emails;
drop table if exists users;
drop table if exists api_tokens;

create table emails
(
	id int auto_increment
		primary key,
	email varchar(256) not null,
	verified tinyint(1) default 0 not null,
	verification_code varchar(32) not null,
	created_at datetime default CURRENT_TIMESTAMP not null
);

create table users
(
	id int auto_increment
		primary key,
	username varchar(32) not null,
	password_hash varchar(256) not null,
	email_id int not null,
	created_at datetime default CURRENT_TIMESTAMP not null,
	constraint users_username_uindex
		unique (username),
	constraint users_emails_id_fk
		foreign key (email_id) references emails (id)
			on update cascade on delete cascade
);

create table api_tokens
(
	id int auto_increment
		primary key,
	token varchar(32) not null,
	user_id int not null,
	created_at datetime default CURRENT_TIMESTAMP not null,
	constraint api_tokens_token_uindex
		unique (token),
	constraint api_tokens_users_id_fk
		foreign key (user_id) references users (id)
			on update cascade on delete cascade
);

