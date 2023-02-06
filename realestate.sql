-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: realestate
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.21-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `description` varchar(255) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `phone` varchar(12) DEFAULT NULL,
  `twitter` varchar(20) DEFAULT NULL,
  `facebook` varchar(30) DEFAULT NULL,
  `instagram` varchar(30) DEFAULT NULL,
  `agent` varchar(30) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES ('WORKAHOLIC\r\nDETERMINED TO HAVE YOU GET THAT DREAM HOUSE','trevor@gmail.com','0779564567','https://twitter.com/','https://www.facebook.com/tsoro','https://www.instagram.com/tsor',NULL,NULL),('workaholic','trevor@gmail.com','0779564567','https://twitter.com/','https://www.facebook.com/tsoro','https://www.instagram.com/tsor','Trevor',NULL);
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `renovations`
--

DROP TABLE IF EXISTS `renovations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `renovations` (
  `renovation` varchar(30) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `renovationId` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`renovationId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `renovations`
--

LOCK TABLES `renovations` WRITE;
/*!40000 ALTER TABLE `renovations` DISABLE KEYS */;
/*!40000 ALTER TABLE `renovations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `fullname` varchar(50) DEFAULT NULL,
  `username` varchar(30) DEFAULT NULL,
  `phone` int(11) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `tenantId` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`tenantId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `agentFullName` varchar(255) DEFAULT NULL,
  `username` varchar(30) DEFAULT NULL,
  `phone` int(11) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `role` varchar(30) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('Takudzwa Ganda','Takudzwa',778979098,'takuganda@mail.com','Agent','$2a$10$4TGeqJayluW.YEmo3YswXeiEA.rnPCxxwXzNr6oyD2TnoUaIWMuIK',1),('Bryan Nyakupeta','Bryan',779564567,'brian@gmail.com','Property Manager','$2a$10$4C7f3E/XCWTjoiShonCqBOPTD5VGdl.CzHs4vxeRjcH2j1i6bbJ72',2),('Trevor Ganda','Trevor',779564567,'trevor@gmail.com','Home Owner','$2a$10$6jLsvKqviF41gU7oAzamwewIST92feJApg2wldCoy.sJLESFC9MhW',3);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacancies`
--

DROP TABLE IF EXISTS `vacancies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacancies` (
  `vacId` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(50) DEFAULT NULL,
  `area` int(11) DEFAULT NULL,
  `rooms` int(11) DEFAULT NULL,
  `bedrooms` int(11) DEFAULT NULL,
  `bathrooms` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `location` varchar(30) DEFAULT NULL,
  `agent` varchar(30) DEFAULT NULL,
  `images` varchar(50) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `amenities` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`vacId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacancies`
--

LOCK TABLES `vacancies` WRITE;
/*!40000 ALTER TABLE `vacancies` DISABLE KEYS */;
INSERT INTO `vacancies` VALUES (12,'300 arcturus road',200,5,2,1,250,'Greendale','Trevor','images/[object Object]',NULL,'garage wifi  durawall','familia'),(13,'100 harare drive',654,5,4,1,100,'Greendale','Takudzwa','images/T',NULL,'durawall','life'),(14,'67 Budiriro 1',2000,6,1,2,250,'Harare','Takudzwa','images/T',NULL,'garage wifi  durawall','familia'),(15,'50 kotwa',1000,10,2,2,500,'Mutoko',NULL,'images/[object Object]',NULL,'garage wifi  durawall','familia'),(16,'120 Ganges Road Belvedere',2000,7,2,1,300,'Harare',NULL,'u',NULL,'garage wifi  durawall','familia'),(17,'2345 glenview',200,6,2,1,350,'Harare','Trevor','Trevorimages-1665661554293.jpg',NULL,'garage wifi  durawall','familkia'),(18,'45 Unit A ext Chitungwiza',250,7,2,2,250,'Harare','Takudzwa','Takudzwaimages-1665663801304.jpg',NULL,'durawall','familia'),(20,'34 Highfield Road',200,5,2,1,150,'Harare','Takudzwa',NULL,NULL,'durawall','family');
/*!40000 ALTER TABLE `vacancies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `name` varchar(30) DEFAULT NULL,
  `vidId` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`vidId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES ('video-1663762665924.mp4',1),('video-1663830078107.mp4',2),('video-1663837396387.mp4',3),('video-1663837604861.mp4',4);
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-10-13 15:18:56
