drop table if exists users;
drop table if exists api_tokens;
drop table if exists forgot_password_codes;
drop table if exists pictures;

-- table to store users
create table users
(
	id int auto_increment
		primary key,
	username varchar(32) not null,
	password_hash varchar(256) not null,
	email varchar(256) not null,
	email_verified tinyint(1) default 0 not null,
	email_verification_code varchar(32) not null,
	created_at datetime default CURRENT_TIMESTAMP not null,
	constraint users_username_uindex
		unique (username)
);

-- table to store api tokens, grants users access to api
-- and identifies all of their requests
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

-- table to store forgot password codes that we have generated
-- and sent to user's email
create table forgot_password_codes
(
	id int auto_increment
		primary key,
	code varchar(32) not null,
	user_id int not null,
	used tinyint(1) default 0 not null,
	created_at datetime default CURRENT_TIMESTAMP not null,
	constraint forgot_password_codes_code_uindex
		unique (code),
	constraint forgot_password_codes_users_id_fk
		foreign key (user_id) references users (id)
			on update cascade on delete cascade
);

-- table to store info on pictures uploaded by users
create table pictures
(
	id int auto_increment
		primary key,
	pretty_id varchar(6) not null,
	file_name varchar(32) not null,
	file_type varchar(4) not null,
	caption varchar(256) null,
	user_id int not null,
	created_at datetime default CURRENT_TIMESTAMP not null,
	constraint pictures_file_name_uindex
		unique (file_name),
	constraint pictures_pretty_id_uindex
		unique (pretty_id),
	constraint pictures_users_id_fk
		foreign key (user_id) references users (id)
			on update cascade on delete cascade
);

-- index pretty id on pictures table because thats how
-- we will be querying them mostly
create index pictures_pretty_id_index
	on pictures (pretty_id);

-- table to store comments made by users on pictures, potentially
-- in response to another comment
create table comments
(
	id int auto_increment
		primary key,
	comment varchar(256) null comment 'Null if comment was deleted',
	picture_id int not null,
	user_id int null comment 'Null if user deleted',
	comment_id int null comment 'Null if root level comment',
	created_at datetime default CURRENT_TIMESTAMP not null,
	constraint comments_comments_id_fk
		foreign key (comment_id) references comments (id),
	constraint comments_pictures_id_fk
		foreign key (picture_id) references pictures (id)
			on update cascade on delete cascade,
	constraint comments_users_id_fk
		foreign key (user_id) references users (id)
			on update set null on delete set null
);