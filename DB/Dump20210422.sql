CREATE DATABASE  IF NOT EXISTS `food` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `food`;
-- MySQL dump 10.13  Distrib 8.0.0-dmr, for Win64 (x86_64)
--
-- Host: localhost    Database: food
-- ------------------------------------------------------
-- Server version	8.0.0-dmr-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) DEFAULT NULL,
  `address_id` varchar(45) NOT NULL,
  `street` varchar(45) NOT NULL,
  `city` varchar(45) NOT NULL,
  `post_code` varchar(45) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `address_id_UNIQUE` (`address_id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (2,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','eea34465-16f8-465f-b3e6-cc514dd1b709','10a bennachie avenue','Inverurie','AB51 4QT','2021-04-21 23:17:05',NULL),(3,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','85020cfd-d86c-414e-b73d-e5e660b6cc3c','10a bennachie avenue','Inverurie','AB51 4QT','2021-04-21 23:21:07',NULL),(4,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','9de7fef6-93b7-40cb-af6a-22c3cae55561','10a bennachie avenue','Inverurie','AB51 4QT','2021-04-21 23:24:19',NULL),(5,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','58cd2d6f-0673-45c3-aefe-fd0679b54500','10a bennachie avenue','Inverurie','AB51 4QT','2021-04-21 23:27:25',NULL),(6,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','6d1a4f5c-38e4-4db5-ad7f-72c4e4541b10','10a bennachie avenue','Inverurie','AB51 4QT','2021-04-21 23:31:35',NULL),(7,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','76bcc175-c37b-4285-a86e-9e837c8e4310','10a bennachie avenue','Inverurie','AB51 4QT','2021-04-21 23:49:04',NULL);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery`
--

DROP TABLE IF EXISTS `delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `delivery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `delivery_id` varchar(45) DEFAULT NULL,
  `worker_id` varchar(45) DEFAULT NULL,
  `time` timestamp NULL DEFAULT NULL,
  `address_id` varchar(45) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery`
--

LOCK TABLES `delivery` WRITE;
/*!40000 ALTER TABLE `delivery` DISABLE KEYS */;
INSERT INTO `delivery` VALUES (89,'a2f2565c-55c0-4c5a-a6a0-d0037fadd7fd',NULL,'2021-04-22 23:16:00','eea34465-16f8-465f-b3e6-cc514dd1b709',NULL,NULL),(90,'dabe1e6e-3da1-43e3-b208-1610d289a03b',NULL,'2021-04-22 23:20:00','85020cfd-d86c-414e-b73d-e5e660b6cc3c',NULL,NULL),(91,'da0f8224-9c6e-49d5-abee-84d3e9f02c14',NULL,'2021-04-22 23:23:00','9de7fef6-93b7-40cb-af6a-22c3cae55561',NULL,NULL),(92,'c67495de-0a49-48f5-b347-9c45b7183cf8',NULL,'2021-04-22 23:26:00','58cd2d6f-0673-45c3-aefe-fd0679b54500',NULL,NULL),(93,'9036a444-d4ad-4780-9d97-1fb86257a5e0',NULL,'2021-04-22 23:31:00','6d1a4f5c-38e4-4db5-ad7f-72c4e4541b10',NULL,NULL),(94,'34b076d1-2ede-4717-8553-7ea2de2b24a1',NULL,'2021-04-22 23:48:00','76bcc175-c37b-4285-a86e-9e837c8e4310',NULL,NULL);
/*!40000 ALTER TABLE `delivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `details`
--

DROP TABLE IF EXISTS `details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(45) DEFAULT NULL,
  `product_id` varchar(45) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `details`
--

LOCK TABLES `details` WRITE;
/*!40000 ALTER TABLE `details` DISABLE KEYS */;
INSERT INTO `details` VALUES (164,'a91360a4-923d-46c1-9e0b-f7f7211cc0b7','04e24436-502f-11eb-ae93-0242ac130002',1),(165,'a91360a4-923d-46c1-9e0b-f7f7211cc0b7','04e246e8-502f-11eb-ae93-0242ac130002',1),(166,'9b160821-9ab5-4602-9a7c-80b3eb07426b','04e24436-502f-11eb-ae93-0242ac130002',1),(167,'9b160821-9ab5-4602-9a7c-80b3eb07426b','04e246e8-502f-11eb-ae93-0242ac130002',1),(168,'9b160821-9ab5-4602-9a7c-80b3eb07426b','4918acd6-dc96-471b-989f-f1fe884b90fd',1),(169,'9b160821-9ab5-4602-9a7c-80b3eb07426b','d45b890b-4107-42fb-bcd0-bbea680f0724',2),(170,'f1fb6663-3fa2-46f8-b0bb-1ccb80e0ce8b','04e246e8-502f-11eb-ae93-0242ac130002',1),(171,'f1fb6663-3fa2-46f8-b0bb-1ccb80e0ce8b','4918acd6-dc96-471b-989f-f1fe884b90fd',1),(172,'162de2e3-6045-4c9d-9296-b531e1f8ec17','04e246e8-502f-11eb-ae93-0242ac130002',1),(173,'162de2e3-6045-4c9d-9296-b531e1f8ec17','4918acd6-dc96-471b-989f-f1fe884b90fd',1),(174,'9994272e-a75f-4e4a-9516-e8bb182be635','04e24436-502f-11eb-ae93-0242ac130002',1),(175,'9994272e-a75f-4e4a-9516-e8bb182be635','04e246e8-502f-11eb-ae93-0242ac130002',1),(176,'638b100f-edf9-4213-9722-1d1c833025b1','04e24436-502f-11eb-ae93-0242ac130002',1),(177,'638b100f-edf9-4213-9722-1d1c833025b1','04e246e8-502f-11eb-ae93-0242ac130002',1),(178,'9ac2640d-9286-4fb8-8439-748e4821cf58','04e24436-502f-11eb-ae93-0242ac130002',2),(179,'9ac2640d-9286-4fb8-8439-748e4821cf58','04e246e8-502f-11eb-ae93-0242ac130002',2),(180,'49ae1041-d005-4eac-a558-8530782ceb29','04e24436-502f-11eb-ae93-0242ac130002',3),(181,'49ae1041-d005-4eac-a558-8530782ceb29','04e246e8-502f-11eb-ae93-0242ac130002',3),(182,'a94d0b22-09fe-4b0e-b1ac-50c6980dae57','04e24436-502f-11eb-ae93-0242ac130002',4),(183,'a94d0b22-09fe-4b0e-b1ac-50c6980dae57','04e246e8-502f-11eb-ae93-0242ac130002',4),(184,'927823cf-d3ae-4845-9c78-341dcb07001f','04e24436-502f-11eb-ae93-0242ac130002',5),(185,'927823cf-d3ae-4845-9c78-341dcb07001f','04e246e8-502f-11eb-ae93-0242ac130002',4),(186,'8f2b292d-75cf-4974-ae54-b4ef538fef55','04e24436-502f-11eb-ae93-0242ac130002',5),(187,'8f2b292d-75cf-4974-ae54-b4ef538fef55','04e246e8-502f-11eb-ae93-0242ac130002',5),(188,'6abf735d-a83d-44bb-8114-a56ac9d53ae6','04e24436-502f-11eb-ae93-0242ac130002',5),(189,'6abf735d-a83d-44bb-8114-a56ac9d53ae6','04e246e8-502f-11eb-ae93-0242ac130002',5),(190,'6abf735d-a83d-44bb-8114-a56ac9d53ae6','4918acd6-dc96-471b-989f-f1fe884b90fd',1),(191,'db05bf48-e2a3-48e1-b399-febe016c3fe6','04e24436-502f-11eb-ae93-0242ac130002',1),(192,'7135a186-3876-4b52-90df-da76942059e7','04e24436-502f-11eb-ae93-0242ac130002',1),(193,'ecfe21c3-c950-4670-af23-cc71036aeb22','04e24436-502f-11eb-ae93-0242ac130002',4),(194,'ecfe21c3-c950-4670-af23-cc71036aeb22','04e246e8-502f-11eb-ae93-0242ac130002',2),(195,'ecfe21c3-c950-4670-af23-cc71036aeb22','4918acd6-dc96-471b-989f-f1fe884b90fd',2),(196,'ecfe21c3-c950-4670-af23-cc71036aeb22','4038076c-7156-11eb-9439-0242ac130002',1),(197,'41486635-a4fd-4bd8-8616-aafbe2f698f7','04e24436-502f-11eb-ae93-0242ac130002',5),(198,'41486635-a4fd-4bd8-8616-aafbe2f698f7','04e246e8-502f-11eb-ae93-0242ac130002',2),(199,'41486635-a4fd-4bd8-8616-aafbe2f698f7','4918acd6-dc96-471b-989f-f1fe884b90fd',2),(200,'41486635-a4fd-4bd8-8616-aafbe2f698f7','4038076c-7156-11eb-9439-0242ac130002',1),(201,'c246d471-130c-4afa-85d7-f59f9928263f','04e24436-502f-11eb-ae93-0242ac130002',2),(202,'c246d471-130c-4afa-85d7-f59f9928263f','04e246e8-502f-11eb-ae93-0242ac130002',1),(203,'4120e557-2433-4dc1-bebc-b03afa4569d3','04e24436-502f-11eb-ae93-0242ac130002',2),(204,'4120e557-2433-4dc1-bebc-b03afa4569d3','04e246e8-502f-11eb-ae93-0242ac130002',1),(205,'689c112b-27b9-4708-b7d5-f6ed6d5254f5','04e24436-502f-11eb-ae93-0242ac130002',2),(206,'689c112b-27b9-4708-b7d5-f6ed6d5254f5','04e246e8-502f-11eb-ae93-0242ac130002',1),(207,'d8414f11-0e9e-4136-91b1-f7ce37123a7d','04e24436-502f-11eb-ae93-0242ac130002',2),(208,'d8414f11-0e9e-4136-91b1-f7ce37123a7d','04e246e8-502f-11eb-ae93-0242ac130002',1),(209,'7168daeb-2bb2-40c1-8ba6-d84923569c88','04e24436-502f-11eb-ae93-0242ac130002',2),(210,'7168daeb-2bb2-40c1-8ba6-d84923569c88','04e246e8-502f-11eb-ae93-0242ac130002',1);
/*!40000 ALTER TABLE `details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) DEFAULT NULL,
  `order_id` varchar(45) DEFAULT NULL,
  `delivery_id` varchar(45) DEFAULT NULL,
  `payment_id` varchar(45) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  `price` int(11) DEFAULT NULL,
  `fee` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id_UNIQUE` (`order_id`),
  UNIQUE KEY `delivery_id_UNIQUE` (`delivery_id`),
  UNIQUE KEY `payment_id_UNIQUE` (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (134,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','41486635-a4fd-4bd8-8616-aafbe2f698f7','a2f2565c-55c0-4c5a-a6a0-d0037fadd7fd','pi_1IipHZK7XxBFOf2K8Oylce7Y',1,1567,350,'2021-04-21 23:17:05','2021-04-22 00:03:05',NULL),(135,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','c246d471-130c-4afa-85d7-f59f9928263f','dabe1e6e-3da1-43e3-b208-1610d289a03b','pi_1IipLSK7XxBFOf2KOMXX7dpg',0,500,350,'2021-04-21 23:21:07','2021-04-21 23:21:07',NULL),(136,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','4120e557-2433-4dc1-bebc-b03afa4569d3','da0f8224-9c6e-49d5-abee-84d3e9f02c14','pi_1IipOZK7XxBFOf2KNJ1Xqzbt',0,500,350,'2021-04-21 23:24:19','2021-04-21 23:24:20',NULL),(137,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','689c112b-27b9-4708-b7d5-f6ed6d5254f5','c67495de-0a49-48f5-b347-9c45b7183cf8','pi_1IipRZK7XxBFOf2KfHLzoSpE',0,500,350,'2021-04-21 23:27:25','2021-04-21 23:27:26',NULL),(138,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','d8414f11-0e9e-4136-91b1-f7ce37123a7d','9036a444-d4ad-4780-9d97-1fb86257a5e0','pi_1IipVbK7XxBFOf2K1IDTXXcx',0,500,350,'2021-04-21 23:31:35','2021-04-21 23:31:36',NULL),(139,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','7168daeb-2bb2-40c1-8ba6-d84923569c88','34b076d1-2ede-4717-8553-7ea2de2b24a1','pi_1IipmWK7XxBFOf2K8ksqjZGJ',0,500,350,'2021-04-21 23:49:04','2021-04-21 23:49:05',NULL);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` varchar(45) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `category` int(11) DEFAULT NULL,
  `brand` int(11) DEFAULT NULL,
  `name` varchar(45) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `des` varchar(45) COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `image_url` text COLLATE utf8mb4_0900_ai_ci,
  `price` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id_UNIQUE` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'04e24436-502f-11eb-ae93-0242ac130002',NULL,NULL,'Milk','Full fat whole mile (4 Pints)','http://localhost:3001/productImage/04e24436-502f-11eb-ae93-0242ac130002.jpeg',150,'2021-02-21 22:36:58','2021-01-05 00:46:36',NULL),(2,'04e246e8-502f-11eb-ae93-0242ac130002',NULL,NULL,'Orange Jucie','Tasty fresh orange juice (1 L)','http://localhost:3001/productImage/04e246e8-502f-11eb-ae93-0242ac130002.jpeg',200,'2021-02-21 22:36:58','2021-01-05 01:09:23',NULL),(3,'4918acd6-dc96-471b-989f-f1fe884b90fd',NULL,NULL,'Baked Beans','Beans in Tomato Sauce','http://localhost:3001/productImage/4918acd6-dc96-471b-989f-f1fe884b90fd.jpeg',109,'2021-02-21 22:36:58','2021-01-05 01:11:41',NULL),(4,'4038076c-7156-11eb-9439-0242ac130002',NULL,NULL,'Gravy Granules','Super quick to make (500g)',NULL,199,'2021-02-17 19:28:45','2021-01-05 01:12:04',NULL),(5,'d45b890b-4107-42fb-bcd0-bbea680f0724',NULL,NULL,'Cheese and Onion Crisps','One of the best flavours (6 pack)','http://localhost:3001/productImage/d45b890b-4107-42fb-bcd0-bbea680f0724.jpeg',259,'2021-02-21 22:36:58','2021-01-05 01:13:08',NULL),(6,'3be51146-7156-11eb-9439-0242ac130002',NULL,NULL,'Extra Mature Cheddar Cheese','400G Tesco on brand',NULL,200,'2021-02-17 19:28:45','2021-01-05 01:16:07',NULL),(7,'344f8510-7156-11eb-9439-0242ac130002',NULL,NULL,'Coke a Cola','6 pack',NULL,253,'2021-02-17 19:28:45','2021-02-11 23:56:22',NULL);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) NOT NULL,
  `g_id` varchar(45) DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `phone_number` varchar(45) DEFAULT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `stripe_id` varchar(45) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `g_id_UNIQUE` (`g_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (7,'f464b075-715e-41b5-9511-9a9b36c8496d','108721296974918683362','m2a9x45@gmail.com','123','m2a9x45',NULL,'cus_JJFtw01IkvABIl','2021-04-20 19:05:20','2021-04-15 22:10:02'),(8,'bb324ab8-6f6b-48bf-8065-ede2300d8eca','117050309336964511590','dukelowlewis@gmail.com','+44 7561 161109','Lewis','Dukelow','cus_JJG5LjFufLpM1Z','2021-04-20 23:22:11','2021-04-15 22:22:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-22  1:08:51
