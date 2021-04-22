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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-22  1:09:51
