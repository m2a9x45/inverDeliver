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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-22  1:09:51
