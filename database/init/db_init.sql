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
	`lang`		INTEGER NOT NULL DEFAULT 0 CHECK (lang == 0 OR lang == 1),
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
	`id`				INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`car_id` 			INTEGER NOT NULL,
	`parking_lot_id`	INTEGER NOT NULL,
	`start` 			TEXT NOT NULL,
	`end` 				TEXT NOT NULL,
	`price` 			REAL NOT NULL CHECK (price >= 0)
);

CREATE TABLE `parking_lot` (
	`id`				INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`parking_staion_id`	INTEGER NOT NULL
);

CREATE TABLE `parking_station` (
	`id` 			INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`email`			TEXT NOT NULL UNIQUE,
	`password`		TEXT NOT NULL,
	`tin` 			INTEGER NOT NULL UNIQUE,
	`company_name` 	TEXT NOT NULL UNIQUE,
	`tax_office` 	TEXT NOT NULL,
	`address` 		TEXT NOT NULL,
	`phone` 		INTEGER NOT NULL,
	`lots` 			INTEGER NOT NULL CHECK (lots >= 0),
	`location` 		TEXT NOT NULL,
	`name` 			TEXT,
	`type`			INTEGER NOT NULL DEFAULT 0 CHECK (type == 0 OR type == 1 OR type == 2),
	`lang`			INTEGER NOT NULL DEFAULT 0 CHECK (lang == 0 OR lang == 1),
	`photo` 		TEXT NOT NULL UNIQUE,
	`work_hours` 	TEXT NOT NULL DEFAULT '24/7',
	`price_list` 	TEXT NOT NULL,
	`discount` 		INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <=100),
	`info` 			TEXT,
	`s_height` 		REAL NOT NULL CHECK (s_height > 0),
	`s_length` 		REAL NOT NULL CHECK (s_length > 0),
	`s_covered` 	INTEGER NOT NULL DEFAULT 1 CHECK (s_covered == 0 OR s_covered == 1),
	`s_keys` 		INTEGER NOT NULL DEFAULT 1 CHECK (s_keys == 0 OR s_keys == 1),
	`s_card` 		INTEGER NOT NULL DEFAULT 1 CHECK (s_card == 0 OR s_card == 1),
	`s_charger` 	INTEGER NOT NULL DEFAULT 0 CHECK (s_charger == 0 OR s_charger == 1),
	`s_english` 	INTEGER NOT NULL DEFAULT 0 CHECK (s_english == 0 OR s_english == 1),
	`s_camera` 		INTEGER NOT NULL DEFAULT 0 CHECK (s_camera == 0 OR s_camera == 1),
	`s_wash` 		INTEGER NOT NULL DEFAULT 0 CHECK (s_wash == 0 OR s_wash == 1)
);
CREATE TABLE `review` (
	`id`					INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`parking_station_id` 	INTEGER NOT NULL,
	`stars` 				INTEGER NOT NULL CHECK (stars >= 0 OR stars <= 5),
	`description` 			TEXT
);

INSERT INTO `user` VALUES (1,'1@1','1234','Anast','694444', 0,'444',5);
INSERT INTO `user` VALUES (2,'2@2','2345','Mike','69444555', 1,'333',10);

INSERT INTO `parking_station` VALUES (1,'2@2','2345','0123456789','Park&DriveA.E.','Chiou','Ritsou 19',6987453254,5,'23.717539/37.983810','ParknDrivee',0,0,'1.png','24/7','1-2-3-4-5',0,NULL,5.2,3.1,0,0,0,0,0,0,0);
INSERT INTO `parking_station` VALUES (2,'2@3','23465','012345678910','Park&nDriveA.E.','Chiou','Ritsou 18',6987453254,10,'23.737539/37.983810','Parkn',0,1,'2.png','24/7','1-2-3-4-5',0,NULL,4.2,2.1,0,0,0,0,0,0,0);
