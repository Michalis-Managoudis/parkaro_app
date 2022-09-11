DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `car`;
DROP TABLE IF EXISTS `reservation`;
DROP TABLE IF EXISTS `parking_lot`;
DROP TABLE IF EXISTS `parking_station`;
DROP TABLE IF EXISTS `review`;

CREATE TABLE `user` (
	`id`					INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`email`					VARCHAR(100) NOT NULL UNIQUE,
	`password`				VARCHAR(100) NOT NULL,
	`name`					VARCHAR(100) NOT NULL,
	`phone` 				BIGINT NOT NULL UNIQUE,
	`lang`					TINYINT UNSIGNED NOT NULL DEFAULT 0, CHECK (lang = 0 OR lang = 1),
	`photo` 				VARCHAR(100),
	`points` 				INT UNSIGNED NOT NULL DEFAULT 0, CHECK (points >= 0)
);

CREATE TABLE `car` (
	`id`					INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`user_id` 				INT UNSIGNED NOT NULL REFERENCES user(id),
	`plate` 				VARCHAR(100) NOT NULL UNIQUE,
	`model` 				VARCHAR(100),
	`color` 				VARCHAR(100) DEFAULT 'black',
	`photo` 				VARCHAR(100)
);

CREATE TABLE `reservation` (
	`id`					INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`car_id` 				INT UNSIGNED NOT NULL REFERENCES car(id),
	`parking_lot_id`		INT UNSIGNED NOT NULL REFERENCES parking_lot(id),
	`start` 				VARCHAR(100) NOT NULL,
	`end` 					VARCHAR(100) NOT NULL,
	`price` 				DECIMAL(10,2) NOT NULL, CHECK (price >= 0)
);

CREATE TABLE `parking_lot` (
	`id`					INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`parking_station_id`	INT UNSIGNED NOT NULL REFERENCES parking_station(id)
);

CREATE TABLE `parking_station` (
	`id` 					INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`email`					VARCHAR(100) NOT NULL UNIQUE,
	`password`				VARCHAR(100) NOT NULL,
	`tin` 					BIGINT UNSIGNED NOT NULL UNIQUE,
	`company_name` 			VARCHAR(100) NOT NULL UNIQUE,
	`tax_office` 			VARCHAR(100) NOT NULL,
	`address` 				VARCHAR(100) NOT NULL,
	`phone` 				BIGINT NOT NULL,
	`lots` 					INT UNSIGNED NOT NULL, CHECK (lots >= 0),
	`location` 				VARCHAR(100) NOT NULL,
	`name` 					VARCHAR(100),
	`type`					TINYINT UNSIGNED NOT NULL DEFAULT 0, CHECK (type = 0 OR type = 1 OR type = 2),
	`lang`					TINYINT UNSIGNED NOT NULL DEFAULT 0, CHECK (lang = 0 OR lang = 1),
	`photo` 				VARCHAR(100) NOT NULL UNIQUE,
	`work_hours` 			VARCHAR(100) NOT NULL DEFAULT '24/7',
	`price_list` 			VARCHAR(100) NOT NULL,
	`discount` 				TINYINT UNSIGNED NOT NULL DEFAULT 0, CHECK (discount >= 0 AND discount <=100),
	`info` 					VARCHAR(100),
	`s_height` 				DECIMAL(5,2) NOT NULL CHECK (s_height > 0),
	`s_length` 				DECIMAL(5,2) NOT NULL CHECK (s_length > 0),
	`s_covered` 			BOOLEAN NOT NULL DEFAULT 1, CHECK (s_covered = 0 OR s_covered = 1),
	`s_keys` 				BOOLEAN NOT NULL DEFAULT 1, CHECK (s_keys = 0 OR s_keys = 1),
	`s_card` 				BOOLEAN NOT NULL DEFAULT 1, CHECK (s_card = 0 OR s_card = 1),
	`s_charger` 			BOOLEAN NOT NULL DEFAULT 0, CHECK (s_charger = 0 OR s_charger = 1),
	`s_english` 			BOOLEAN NOT NULL DEFAULT 0, CHECK (s_english = 0 OR s_english = 1),
	`s_camera` 				BOOLEAN NOT NULL DEFAULT 0, CHECK (s_camera = 0 OR s_camera = 1),
	`s_wash` 				BOOLEAN NOT NULL DEFAULT 0, CHECK (s_wash = 0 OR s_wash = 1)
);

CREATE TABLE `review` (
	`id`					INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT REFERENCES reservation(id),
	`parking_id` 			INT UNSIGNED NOT NULL REFERENCES parking_station(id),
	`stars` 				TINYINT UNSIGNED NOT NULL, CHECK (stars >= 0 OR stars <= 5),
	`description` 			TEXT
);

INSERT INTO `user` VALUES (1,'1@1','1234','Anast','694444', 0,'444',5);
INSERT INTO `user` VALUES (2,'2@2','2345','Mike','69444555', 1,'333',10);

INSERT INTO `parking_station` VALUES (1,'2@2','2345','0123456789','Park&DriveA.E.','Chiou','Ritsou 19',6987453255,5,'23.717539/37.983810','ParknDrivee',0,0,'1.png','24/7','1-2-3-4-5',0,NULL,5.2,3.1,0,0,0,0,0,0,0);
INSERT INTO `parking_station` VALUES (2,'2@3','23465','012345678910','Park&nDriveA.E.','Chiou','Ritsou 18',6987453254,10,'23.737539/37.983810','Parkn',0,1,'2.png','24/7','1-2-3-4-5',0,NULL,4.2,2.1,0,0,0,0,0,0,0);
