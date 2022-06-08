DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `car`;
DROP TABLE IF EXISTS `reservation`;
DROP TABLE IF EXISTS `parking_space`;
DROP TABLE IF EXISTS `parking`;
DROP TABLE IF EXISTS `review`;

CREATE TABLE car (
	id integer PRIMARY KEY AUTOINCREMENT,
	user_id integer,
	plate text,
	model text,
	color text,
	photo text
);

CREATE TABLE parking_space (
	id integer PRIMARY KEY AUTOINCREMENT,
	parking_id integer
);

CREATE TABLE reservation (
	id integer PRIMARY KEY AUTOINCREMENT,
	car_id integer,
	parking_id integer,
	start datetime,
	end datetime,
	price float
);

CREATE TABLE user (
	id integer PRIMARY KEY AUTOINCREMENT,
	email text,
	password text,
	name text,
	phone integer,
	photo text,
	points integer
);

CREATE TABLE parking (
	id integer PRIMARY KEY AUTOINCREMENT,
	spaces integer,
	location text,
	photo text,
	work_hours text,
	price_list text,
	discount integer,
	info text,
	s_covered boolean,
	s_keys boolean,
	s_card boolean,
	s_charger boolean,
	s_height float,
	s_length float,
	s_english boolean,
	s_camera boolean,
	s_wash boolean
);

CREATE TABLE review (
	reservation_id integer,
	parking_id integer,
	stars integer,
	description text
);