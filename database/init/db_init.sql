DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `car`;
DROP TABLE IF EXISTS `reservation`;
DROP TABLE IF EXISTS `parking_space`;
DROP TABLE IF EXISTS `parking`;
DROP TABLE IF EXISTS `review`;

CREATE TABLE `user` (
	`id`		INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`email`		TEXT NOT NULL UNIQUE,
	`password`	TEXT NOT NULL,
	`name`		TEXT NOT NULL,
	`phone` 	INTEGER NOT NULL UNIQUE,
	`photo` 	TEXT,
	`points` 	INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0)
);

CREATE TABLE `car` (
	`id`		INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`user_id` 	INTEGER NOT NULL,
	`plate` 	TEXT NOT NULL UNIQUE,
	`model` 	TEXT,
	`color` 	TEXT DEFAULT 'black',
	`photo` 	TEXT
);

CREATE TABLE `reservation` (
	`id`			INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`car_id` 		INTEGER NOT NULL,
	`p_space_id`	INTEGER NOT NULL,
	`start` 		TEXT NOT NULL,
	`end` 			TEXT NOT NULL,
	`price` 		REAL NOT NULL CHECK (price >= 0)
);

CREATE TABLE `parking_space` (
	`id`			INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`parking_id`	INTEGER NOT NULL
);

CREATE TABLE `parking` (
	`id` 			INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`spaces` 		INTEGER NOT NULL CHECK (spaces >= 0),
	`location` 		TEXT NOT NULL,
	`photo` 		TEXT NOT NULL UNIQUE,
	`work_hours` 	TEXT NOT NULL DEFAULT '24/7',
	`price_list` 	TEXT NOT NULL,
	`discount` 		INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <=100),
	`info` 			TEXT,
	`s_covered` 	INTEGER NOT NULL DEFAULT 1 CHECK (s_covered == 0 OR s_covered == 1),
	`s_keys` 		INTEGER NOT NULL DEFAULT 1 CHECK (s_keys == 0 OR s_keys == 1),
	`s_card` 		INTEGER NOT NULL DEFAULT 1 CHECK (s_card == 0 OR s_card == 1),
	`s_charger` 	INTEGER NOT NULL DEFAULT 0 CHECK (s_charger == 0 OR s_charger == 1),
	`s_height` 		REAL NOT NULL CHECK (s_height > 0),
	`s_length` 		REAL NOT NULL CHECK (s_length > 0),
	`s_english` 	INTEGER NOT NULL DEFAULT 0 CHECK (s_english == 0 OR s_english == 1),
	`s_camera` 		INTEGER NOT NULL DEFAULT 0 CHECK (s_camera == 0 OR s_camera == 1),
	`s_wash` 		INTEGER NOT NULL DEFAULT 0 CHECK (s_wash == 0 OR s_wash == 1)
);
CREATE TABLE `review` (
	`id`			INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`parking_id` 	INTEGER NOT NULL,
	`stars` 		INTEGER NOT NULL CHECK (stars >= 0 OR stars <= 5),
	`description` 	TEXT
);

INSERT INTO `user` VALUES (1,'1@1','1234','Anast','694444','444',5);
INSERT INTO `user` VALUES (2,'2@2','2345','Mike','69444555','333',10);
