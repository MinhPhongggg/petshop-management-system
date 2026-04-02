CREATE DATABASE  IF NOT EXISTS `petshop_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `petshop_db`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_date` date NOT NULL,
  `cancel_reason` text COLLATE utf8mb4_unicode_ci,
  `completed_at` datetime(6) DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_note` text COLLATE utf8mb4_unicode_ci,
  `end_time` time(6) NOT NULL,
  `pet_weight` double DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `staff_note` text COLLATE utf8mb4_unicode_ci,
  `start_time` time(6) NOT NULL,
  `status` enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `pet_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `staff_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_q97166k18hklq6ls46osbrftx` (`booking_code`),
  KEY `FKtqiynyn86mqebi3mcwfn4ecvl` (`pet_id`),
  KEY `FKdruq81v9438hq8ks39rs4s892` (`service_id`),
  KEY `FKq77lf1nt94ny672p97mnhhsnv` (`staff_id`),
  KEY `FKeyog2oic85xg7hsu2je2lx3s6` (`user_id`),
  CONSTRAINT `FKdruq81v9438hq8ks39rs4s892` FOREIGN KEY (`service_id`) REFERENCES `spa_services` (`id`),
  CONSTRAINT `FKeyog2oic85xg7hsu2je2lx3s6` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKq77lf1nt94ny672p97mnhhsnv` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKtqiynyn86mqebi3mcwfn4ecvl` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK17726759154912AEB','2026-03-13',NULL,NULL,NULL,'2026-03-05 01:58:35.496404','','10:30:00.000000',NULL,280000.00,NULL,'09:30:00.000000','COMPLETED','2026-03-05 02:30:49.378528',2,4,NULL,5);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_oce3937d2f4mpfqrycbr0l93m` (`name`),
  UNIQUE KEY `UK_pnhnc9urm6fro7oseu9vka70q` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,_binary '',NULL,'2026-02-23 07:10:46.061266',NULL,NULL,'Royal Canin','royal-canin','2026-02-23 07:10:46.061266'),(2,_binary '',NULL,'2026-02-23 07:10:46.224888',NULL,NULL,'Whiskas','whiskas','2026-02-23 07:10:46.224888'),(3,_binary '',NULL,'2026-02-23 07:10:46.253878',NULL,NULL,'Cature','cature','2026-02-23 07:10:46.253878'),(4,_binary '',NULL,'2026-02-23 07:10:46.274885',NULL,NULL,'Pedigree','pedigree','2026-02-23 07:10:46.274885'),(5,_binary '',NULL,'2026-02-23 07:10:46.313962',NULL,NULL,'SOS','sos','2026-02-23 07:10:46.313962'),(6,_binary '',NULL,'2026-03-10 15:37:31.802233',NULL,NULL,'SmartHeart','smartheart','2026-03-10 15:37:31.802233'),(7,_binary '',NULL,'2026-03-10 15:37:31.942239',NULL,NULL,'OEM','oem','2026-03-10 15:37:31.942239'),(8,_binary '',NULL,'2026-03-10 15:37:32.008439',NULL,NULL,'Frontline','frontline','2026-03-10 15:37:32.008439'),(9,_binary '',NULL,'2026-03-10 15:37:32.131937',NULL,NULL,'Inaba','inaba','2026-03-10 15:37:32.131937');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `quantity` int NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKtqui2xapupvn22rpgk9ytimt5` (`user_id`,`variant_id`),
  KEY `FK5yyw1o0dor9gmxfra1dqvn4qa` (`variant_id`),
  CONSTRAINT `FK5yyw1o0dor9gmxfra1dqvn4qa` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `FK709eickf3kc0dujx3ub9i7btf` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pet_type` enum('DOG','CAT','BIRD','FISH','OTHER','ALL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKsaok720gsu4u2wrgbk10b5n8d` (`parent_id`),
  CONSTRAINT `FKsaok720gsu4u2wrgbk10b5n8d` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,_binary '','2026-02-23 01:54:26.411417','',0,'','Chó','DOG','cho','2026-03-10 03:00:32.830086',NULL),(2,_binary '','2026-02-23 01:55:04.578818','',1,'','Mèo','CAT','meo','2026-02-23 01:55:04.578818',NULL),(3,_binary '\0','2026-02-23 01:55:52.797653','',2,'','Thú nhỏ','OTHER','thu-nho','2026-03-10 14:36:38.278632',NULL),(4,_binary '','2026-02-23 02:01:25.560109','',0,'','Thức ăn cho chó','DOG','thuc-an-cho-cho','2026-03-10 03:49:12.094818',1),(5,_binary '','2026-02-23 02:01:56.458391','',0,'','Bánh Thưởng','DOG','banh-thuong','2026-03-10 03:58:27.204827',1),(6,_binary '','2026-02-23 02:02:16.122532','',0,'','Phụ kiện','DOG','phu-kien','2026-03-10 03:50:27.367926',1),(7,_binary '','2026-02-23 02:02:37.868501','',0,'','Chăm sóc sức khỏe cún','DOG','cham-soc-suc-khoe-cun','2026-03-10 03:50:52.423391',1),(8,_binary '','2026-02-23 02:02:53.059646','',0,'','Đồ chơi','DOG','do-choi','2026-03-10 03:51:16.125739',1),(9,_binary '','2026-02-23 02:03:37.419226','',0,'','Thức ăn cho mèo','CAT','thuc-an-cho-meo','2026-03-10 04:03:56.304832',2),(10,_binary '','2026-02-23 02:03:53.124380','',0,'','Phụ kiện - Đồ chơi','CAT','phu-kien-do-choi','2026-03-10 04:04:22.587548',2),(11,_binary '','2026-02-23 02:04:07.648950','',0,'','Vận chuyển - Chuồng','CAT','van-chuyen-chuong','2026-03-10 04:04:50.083207',2),(12,_binary '','2026-02-23 02:04:18.981791','',0,'','Chăm sóc sức khỏe','CAT','cham-soc-suc-khoe','2026-03-10 04:06:38.973338',2),(13,_binary '','2026-03-10 03:51:26.510810','',0,'','Vận chuyển','ALL','van-chuyen','2026-03-10 03:51:26.510810',1),(14,_binary '','2026-03-10 03:54:35.229443','',0,'','Thức ăn hạt','ALL','thuc-an-hat','2026-03-10 03:54:35.229443',4),(15,_binary '','2026-03-10 03:54:56.852900','',0,'','Thức ăn ướt','ALL','thuc-an-uot','2026-03-10 03:54:56.852900',4),(16,_binary '','2026-03-10 03:55:57.364271','',0,'','Thức ăn hỗ trợ điều trị bệnh','ALL','thuc-an-ho-tro-dieu-tri-benh','2026-03-10 03:55:57.364271',4),(17,_binary '','2026-03-10 03:56:12.352129','',0,'','Thức ăn hữu cơ','ALL','thuc-an-huu-co','2026-03-10 03:56:12.352129',4),(18,_binary '','2026-03-10 03:56:33.398317','',0,'','Thức ăn không ngũ cốc','ALL','thuc-an-khong-ngu-coc','2026-03-10 03:56:33.398317',4),(19,_binary '','2026-03-10 03:57:04.302042','',0,'','Bánh thưởng mềm','ALL','banh-thuong-mem','2026-03-10 03:57:04.302042',5),(20,_binary '','2026-03-10 03:57:27.862770','',0,'','Xương gặm sạch răng','ALL','xuong-gam-sach-rang','2026-03-10 03:57:27.862770',5),(21,_binary '','2026-03-10 03:57:42.150459','',0,'','Súp thưởng','ALL','sup-thuong','2026-03-10 03:57:42.150459',5),(22,_binary '','2026-03-10 03:57:57.545353','',0,'','Bánh quy','ALL','banh-quy','2026-03-10 03:57:57.545353',5),(23,_binary '','2026-03-10 03:58:13.669874','',0,'','Thịt sấy khô','ALL','thit-say-kho','2026-03-10 03:58:13.669874',5),(24,_binary '','2026-03-10 03:59:03.406988','',0,'','Vòng cổ & Dây dắt','ALL','vong-co-day-dat','2026-03-10 03:59:03.406988',6),(25,_binary '','2026-03-10 03:59:23.818626','',0,'','Quần áo & Nón mũ','ALL','quan-ao-non-mu','2026-03-10 03:59:23.818626',6),(26,_binary '','2026-03-10 03:59:37.045283','',0,'','Dụng cụ ăn uống','ALL','dung-cu-an-uong','2026-03-10 03:59:37.045283',6),(27,_binary '','2026-03-10 03:59:59.376614','',0,'','Nệm - Chuồng cho cuốn','ALL','nem-chuong-cho-cuon','2026-03-10 03:59:59.376614',6),(28,_binary '','2026-03-10 04:00:24.610588','',0,'','Tả lót & Khay vệ sinh','ALL','ta-lot-khay-ve-sinh','2026-03-10 04:00:24.610588',6),(29,_binary '','2026-03-10 04:00:49.521686','',0,'','Vitamin cho chó','ALL','vitamin-cho-cho','2026-03-10 04:00:49.521686',7),(30,_binary '','2026-03-10 04:01:10.083412','',0,'','Trị ve rận & Xổ giun','ALL','tri-ve-ran-xo-giun','2026-03-10 04:01:10.083412',7),(31,_binary '','2026-03-10 04:01:25.622099','',0,'','Thực phẩm chức năng','ALL','thuc-pham-chuc-nang','2026-03-10 04:01:25.622099',7),(32,_binary '','2026-03-10 04:01:46.660721','',0,'','Xương gặm','ALL','xuong-gam','2026-03-10 04:01:46.660721',8),(33,_binary '','2026-03-10 04:01:58.286926','',0,'','Nhồi bông','ALL','nhoi-bong','2026-03-10 04:01:58.286926',8),(34,_binary '','2026-03-10 04:02:24.829196','',0,'','Huấn luyện  & Tương tác','ALL','huan-luyen-tuong-tac','2026-03-10 04:02:24.829196',8),(35,_binary '','2026-03-10 04:02:51.796390','',0,'','Balo & Túi vận chuyển','ALL','balo-tui-van-chuyen','2026-03-10 04:02:51.796390',13),(36,_binary '','2026-03-10 04:03:11.916409','',0,'','Lòng vận chuyển','ALL','long-van-chuyen','2026-03-10 04:03:11.916409',13),(37,_binary '','2026-03-10 04:05:11.734533','',0,'','Sữa & Bình bú cho mèo','ALL','sua-binh-bu-cho-meo','2026-03-10 04:06:23.899713',12),(38,_binary '','2026-03-10 04:08:22.268596','',0,'','Vitamin & Thực phẩm bổ sung','ALL','vitamin-thuc-pham-bo-sung','2026-03-10 04:08:22.268596',12),(39,_binary '','2026-03-10 04:08:35.038864','',0,'','Vệ sinh','ALL','ve-sinh','2026-03-10 04:08:35.038864',2),(40,_binary '','2026-03-10 08:07:58.176052','',0,'','Thức ăn hạt','ALL','meo-thuc-an-cho-meo-thuc-an-hat','2026-03-10 08:07:58.176052',9),(41,_binary '','2026-03-10 08:08:13.669948','',0,'','Thức ăn ướt','ALL','meo-thuc-an-cho-meo-thuc-an-uot','2026-03-13 15:43:57.462900',9),(42,_binary '','2026-03-10 08:08:34.373332','',0,'','Thức ăn điều trị bệnh','ALL','meo-thuc-an-cho-meo-thuc-an-dieu-tri-benh','2026-03-10 08:08:34.373332',9),(43,_binary '','2026-03-10 08:08:47.156966','',0,'','Bánh thưởng mèo','ALL','meo-thuc-an-cho-meo-banh-thuong-meo','2026-03-10 08:08:47.156966',9),(44,_binary '','2026-03-10 08:09:23.522440','',0,'','Đồ chơi','ALL','meo-phu-kien-do-choi-do-choi','2026-03-10 08:09:23.522440',10),(45,_binary '','2026-03-10 08:09:38.318968','',0,'','Thời trang - Quần áo','ALL','meo-phu-kien-do-choi-thoi-trang-quan-ao','2026-03-10 08:09:38.318968',10),(46,_binary '','2026-03-10 08:10:02.008151','',0,'','Vòng cổ - Dây thắt','ALL','meo-phu-kien-do-choi-vong-co-day-that','2026-03-10 08:10:02.008151',10),(47,_binary '','2026-03-10 08:10:35.275773','',0,'','Chuồng - Nhà niệm','ALL','meo-van-chuyen-chuong-chuong-nha-niem','2026-03-10 08:10:35.275773',11),(48,_binary '','2026-03-10 08:10:55.783067','',0,'','Vận chuyển ','ALL','meo-van-chuyen-chuong-van-chuyen','2026-03-10 08:10:55.783067',11),(49,_binary '','2026-03-10 08:11:25.626727','',0,'','Cát mèo','ALL','meo-ve-sinh-cat-meo','2026-03-10 08:11:25.626727',39),(50,_binary '','2026-03-10 08:11:45.607986','',0,'','Chăm sóc răng miệng','ALL','meo-ve-sinh-cham-soc-rang-mieng','2026-03-10 08:11:45.607986',39),(51,_binary '','2026-03-10 08:11:55.641596','',0,'','Sữa tắm','ALL','meo-ve-sinh-sua-tam','2026-03-10 08:11:55.641596',39),(52,_binary '','2026-03-10 08:12:13.232547','',0,'','Xịt khử mùi','ALL','meo-ve-sinh-xit-khu-mui','2026-03-10 08:12:13.232547',39);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reviewed` bit(1) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `variant_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  KEY `FKemq71edpbn9wsxnxncfn1algp` (`variant_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKemq71edpbn9wsxnxncfn1algp` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cancel_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `discount_amount` decimal(12,2) DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `order_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` enum('COD','BANK_TRANSFER','VNPAY','MOMO','ZALOPAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `processing_at` datetime(6) DEFAULT NULL,
  `receiver_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipped_at` datetime(6) DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_fee` decimal(12,2) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','PROCESSING','SHIPPING','DELIVERED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `tracking_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_dhk2umg8ijjkg4njg6891trit` (`order_code`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  KEY `FKdimvsocblb17f45ikjr6xn1wj` (`voucher_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKdimvsocblb17f45ikjr6xn1wj` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `age` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `breed` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `type` enum('DOG','CAT','BIRD','FISH','HAMSTER','RABBIT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `owner_id` bigint NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKoygstexeo9ivoylgrdrv2tc39` (`owner_id`),
  CONSTRAINT `FKoygstexeo9ivoylgrdrv2tc39` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES (1,'2','Cỏ','2026-02-13 09:11:27.860904',NULL,'Bibi','hihihih','DOG','2026-02-13 09:11:27.860904',100,4,NULL,NULL),(2,NULL,'sad','2026-03-05 01:58:35.472720',NULL,'heheh',NULL,'DOG','2026-03-05 01:58:35.473717',12,5,_binary '',NULL);
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` bit(1) NOT NULL,
  `sort_order` int DEFAULT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqnq71xsohugpqwf3c9gxmsuy` (`product_id`),
  CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (7,'2026-02-23 08:08:59.960135','https://petshopsaigon.vn/wp-content/uploads/2020/10/pate-cho-meo-whiskas-chinh-hang-6.jpg',_binary '',0,7),(9,'2026-02-23 08:09:00.054134','https://bizweb.dktcdn.net/100/229/172/products/xuong-denta-stix-75g.jpg?v=1503827671903',_binary '',0,9),(53,'2026-03-10 14:56:03.647895','https://paddy.vn/cdn/shop/files/cat-dau-nanh-cho-meo-cature-tofu.png?v=1704520844',_binary '\0',0,8),(54,'2026-03-10 15:12:30.408791','https://www.vietpet.net/wp-content/uploads/2018/10/thuc-an-cho-cho-royal-canin-size-health-nutrition-indoor-small-breed-adult.jpg',_binary '\0',0,6),(55,'2026-03-10 15:37:31.760535','https://cunyeushop.vn/cdn/images/202110/goods_img/thuc-an-kho-cho-cho-poodle-con-royal-canin-poodle-500g-G5096-1634029568230.jpg',_binary '',0,11),(56,'2026-03-10 15:37:31.829755','https://kinpetshop.com/wp-content/uploads/thuc-an-hat-smartheart-danh-cho-cho-con-vi-bo-va-sua-.jpg',_binary '',0,12),(57,'2026-03-10 15:37:31.877967','https://product.hstatic.net/200000264739/product/pate_pedigree_130g_43b810a9073e4554aed6f430d4388038_master.jpg',_binary '',0,13),(58,'2026-03-10 15:37:31.961586','https://fagopet.vn/uploads/images/62468ae39487f634f84426f8/vong-co-co-chuong.webp',_binary '',0,14),(59,'2026-03-10 15:37:31.988774','https://product.hstatic.net/200000264739/product/o_dem_tron_cho_cho_meo_3_d8cbf4cb0bf0486d841e66685a44d609_master.jpg',_binary '',0,15),(60,'2026-03-10 15:37:32.032459','https://shopvatnuoi.vn/wp-content/uploads/2023/03/thuoc-nho-gay-phong-va-tri-ve-ran-bo-chet-cho-cho-meo-frontline-plus-shop-vat-nuoi-c2.jpg',_binary '',0,16),(61,'2026-03-10 15:37:32.087847','https://paddy.vn/cdn/shop/files/thuc-an-cho-meo-Royal-Canin-Mother-Babycat.jpg?v=1724921548',_binary '',0,17),(62,'2026-03-10 15:37:32.153910','https://paddy.vn/cdn/shop/files/pate-meo-ciao-goi-60g_3_785x.png?v=1704517027',_binary '',0,18),(72,'2026-03-30 11:55:54.212800','https://khanviet.net/uploads/product/2025_07/7365294510d453bf24a14cf180548333-1.jpg',_binary '',0,20),(73,'2026-03-30 11:57:04.298908','https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lv6b83fjbm6174',_binary '',0,19),(74,'2026-03-30 11:57:04.301815','https://khopetshop.net/assets/images/products/gallery/thumbs/12072024022738_713971.jpg_thumb_600x600.jpg',_binary '\0',1,19);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_q935p2d1pbjm39n0063ghnfgn` (`sku`),
  KEY `FKosqitn4s405cynmhb87lkvuau` (`product_id`),
  CONSTRAINT `FKosqitn4s405cynmhb87lkvuau` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (11,_binary '','2026-02-23 08:08:59.953129','Gói 85g',12000.00,'WHI-CAT-85G',100,'2026-02-23 08:08:59.953129',7),(12,_binary '','2026-02-23 08:08:59.956134','Hộp 400g',45000.00,'WHI-CAT-400G',50,'2026-02-23 08:08:59.956134',7),(14,_binary '','2026-02-23 08:09:00.049127','Size S (Cho chó nhỏ)',32000.00,'PED-DEN-S',150,'2026-02-23 08:09:00.049127',9),(15,_binary '','2026-02-23 08:09:00.052127','Size M (Cho chó trung bình)',55000.00,'PED-DEN-M',80,'2026-02-23 08:09:00.052127',9),(55,_binary '','2026-03-10 14:56:03.674068','Túi 6L (2.4kg)',165000.00,'CAT-LAT-6L',200,'2026-03-10 14:56:03.674068',8),(56,_binary '','2026-03-10 15:12:30.411784','2kg',380000.00,'RC-DOG-2KG',50,'2026-03-10 15:12:30.411784',6),(57,_binary '','2026-03-10 15:12:30.412784','5kg',850000.00,'RC-DOG-5KG',30,'2026-03-10 15:12:30.412784',6),(58,_binary '','2026-03-10 15:37:31.747915','Túi 1.5kg',230000.00,'RC-POO-1.5',50,'2026-03-10 15:37:31.748914',11),(59,_binary '','2026-03-10 15:37:31.756541','Túi 3kg',450000.00,'RC-POO-3',30,'2026-03-10 15:37:31.756541',11),(60,_binary '','2026-03-10 15:37:31.824794','Túi 400g',110000.00,'SMH-PUP-400',100,'2026-03-10 15:37:31.824794',12),(61,_binary '','2026-03-10 15:37:31.827247','Túi 1.5kg',280000.00,'SMH-PUP-15',50,'2026-03-10 15:37:31.827247',12),(62,_binary '','2026-03-10 15:37:31.870594','Vị Bò',30000.00,'PED-PATE-BO',200,'2026-03-10 15:37:31.870594',13),(63,_binary '','2026-03-10 15:37:31.874803','Vị Gà',30000.00,'PED-PATE-GA',200,'2026-03-10 15:37:31.874803',13),(64,_binary '','2026-03-10 15:37:31.954806','Size S',25000.00,'VC-CHUONG-S',50,'2026-03-10 15:37:31.954806',14),(65,_binary '','2026-03-10 15:37:31.956578','Size M',35000.00,'VC-CHUONG-M',40,'2026-03-10 15:37:31.956578',14),(66,_binary '','2026-03-10 15:37:31.958591','Size L',45000.00,'VC-CHUONG-L',30,'2026-03-10 15:37:31.958591',14),(67,_binary '','2026-03-10 15:37:31.984766','Size S',199000.00,'NEM-TRON-S',25,'2026-03-10 15:37:31.984766',15),(68,_binary '','2026-03-10 15:37:31.986779','Size M',249000.00,'NEM-TRON-M',15,'2026-03-10 15:37:31.986779',15),(69,_binary '','2026-03-10 15:37:32.014953','Dưới 10kg',175000.00,'FRO-PLUS-10',50,'2026-03-10 15:37:32.014953',16),(70,_binary '','2026-03-10 15:37:32.025927','Từ 10-20kg',220000.00,'FRO-PLUS-20',40,'2026-03-10 15:37:32.025927',16),(71,_binary '','2026-03-10 15:37:32.077330','Túi 400g',260000.00,'RC-KIT-400',40,'2026-03-10 15:37:32.077330',17),(72,_binary '','2026-03-10 15:37:32.081329','Túi 2kg',850000.00,'RC-KIT-2',20,'2026-03-10 15:37:32.081329',17),(73,_binary '','2026-03-10 15:37:32.144862','Vị Cá ngừ',12000.00,'CIAO-CA',500,'2026-03-10 15:37:32.144862',18),(74,_binary '','2026-03-10 15:37:32.146997','Vị Gà',12000.00,'CIAO-GA',500,'2026-03-10 15:37:32.146997',18),(75,_binary '','2026-03-10 15:37:32.147911','Vị Cua',12000.00,'CIAO-CUA',300,'2026-03-10 15:37:32.147911',18),(101,_binary '','2026-03-30 11:55:54.215804','Size S',45000.00,'AO-THU-S',60,'2026-03-30 11:55:54.215804',20),(102,_binary '','2026-03-30 11:55:54.217800','Size M',50000.00,'AO-THU-M',48,'2026-03-30 11:55:54.217800',20),(103,_binary '','2026-03-30 11:55:54.219799','Size L',55000.00,'AO-THU-L',50,'2026-03-30 11:55:54.219799',20),(104,_binary '','2026-03-30 11:57:04.303905','Tiêu chuẩn',15000.00,'CAN-CAU-LV',100,'2026-03-30 11:57:04.303905',19);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `average_rating` decimal(2,1) DEFAULT NULL,
  `base_price` decimal(12,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `featured` bit(1) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_count` int DEFAULT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sold_count` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  `brand_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa3a4mpsfdf4d2y6r8ra3sc8mv` (`brand_id`),
  KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`),
  CONSTRAINT `FKa3a4mpsfdf4d2y6r8ra3sc8mv` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (6,_binary '',0.0,450000.00,'2026-02-23 08:08:59.889134','Thức ăn cho chó Royal Canin Size Health Nutrition Indoor Small Breed Adult được thiết kế cho chó có lối sống chủ yếu là yên tĩnh và trong nhà. Một con chó khỏe mạnh sống trong nhà có thể có xu hướng tập thể dục ít hơn. Có thể ảnh hưởng đến trọng lượng và hệ thống tiêu hóa của mình. Với dinh dưỡng chính xác, Cuộc sống trong nhà giúp hỗ trợ sức khỏe tiêu hóa và giảm mùi và khối lượng phân. Với protein tiêu hóa cao, xơ hòa tan và không hòa tan, và các nguồn carbohydrate chất lượng cao.',_binary '','Thức ăn cho chó Royal Canin',0,NULL,'Thức ăn hạt cao cấp cho chó','thuc-an-cho-cho-royal-canin',0,'2026-03-10 15:12:30.401757',4,NULL),(7,_binary '',0.0,15000.00,'2026-02-23 08:08:59.949134','Pate Whiskas cung cấp đầy đủ dinh dưỡng cho mèo, giúp lông bóng mượt và hệ tiêu hóa khỏe mạnh.',_binary '','Pate Whiskas cho Mèo',0,12000.00,'Pate thơm ngon cho mèo mọi lứa tuổi','pate-whiskas-cho-meo',0,'2026-02-23 08:08:59.949134',9,NULL),(8,_binary '',0.0,180000.00,'2026-02-23 08:09:00.017135','Thành phần 100% tự nhiên, có thể xả trực tiếp trong bồn cầu, an toàn cho mèo.',_binary '\0','Cát vệ sinh đậu nành Cature',0,NULL,'Cát đậu nành tự nhiên, thấm hút tốt','cat-ve-sinh-dau-nanh-cature',0,'2026-03-10 14:56:03.618822',49,NULL),(9,_binary '',0.0,35000.00,'2026-02-23 08:09:00.046134','Thiết kế dạng chữ X giúp làm sạch sâu kẽ răng của cún cưng.',_binary '','Xương gặm sạch răng Pedigree Dentastix',0,32000.00,'Hỗ trợ giảm mảng bám và vôi răng cho chó','xuong-gam-sach-rang-pedigree-dentastix',0,'2026-02-23 08:09:00.046134',7,NULL),(11,_binary '',0.0,250000.00,'2026-03-10 15:37:31.732611','Hỗ trợ tiêu hóa và làm mượt lông cho dòng chó Poodle',_binary '','Thức ăn hạt cho chó Poodle Royal Canin',0,230000.00,'Thức ăn hạt chuyên biệt cho Poodle','thuc-an-hat-cho-cho-poodle-royal-canin',0,'2026-03-10 15:37:31.732611',14,NULL),(12,_binary '',0.0,120000.00,'2026-03-10 15:37:31.811706','Cung cấp đầy đủ dưỡng chất phát triển xương khớp',_binary '\0','Thức ăn hạt cho chó con SmartHeart',0,110000.00,'Thức ăn hạt giàu canxi cho chó con','thuc-an-hat-cho-cho-con-smartheart',0,'2026-03-10 15:37:31.811706',14,NULL),(13,_binary '',0.0,35000.00,'2026-03-10 15:37:31.866569','Thơm ngon kích thích vị giác',_binary '\0','Pate cho chó Pedigree',0,30000.00,'Pate lon dinh dưỡng cho chó','pate-cho-cho-pedigree',0,'2026-03-10 15:37:31.866569',15,NULL),(14,_binary '',0.0,35000.00,'2026-03-10 15:37:31.947751','Có chuông leng keng an toàn',_binary '\0','Vòng cổ chó có chuông',0,25000.00,'Vòng cổ vải dù bền bỉ','vong-co-cho-co-chuong',0,'2026-03-10 15:37:31.947751',24,NULL),(15,_binary '',0.0,250000.00,'2026-03-10 15:37:31.981717','Chất liệu nhung mềm mại dễ giặt',_binary '','Nệm tròn cho chó mèo',0,199000.00,'Nệm êm ái giữ ấm','nem-tron-cho-cho-meo',0,'2026-03-10 15:37:31.981717',27,NULL),(16,_binary '',0.0,180000.00,'2026-03-10 15:37:32.010438','Bảo vệ cún cưng trong 1 tháng',_binary '','Thuốc nhỏ gáy trị ve rận Frontline Plus',0,175000.00,'Diệt ve rận bọ chét hiệu quả','thuoc-nho-gay-tri-ve-ran-frontline-plus',0,'2026-03-10 15:37:32.010438',30,NULL),(17,_binary '',0.0,280000.00,'2026-03-10 15:37:32.075005','Phát triển toàn diện cho mèo dưới 12 tháng',_binary '','Thức ăn hạt cho mèo Royal Canin Kitten',0,260000.00,'Hạt dinh dưỡng cho mèo con','thuc-an-hat-cho-meo-royal-canin-kitten',0,'2026-03-10 15:37:32.075005',40,NULL),(18,_binary '',0.0,15000.00,'2026-03-10 15:37:32.143255','Bổ sung nước và vitamin cho mèo',_binary '','Pate Ciao Churu cho mèo',0,12000.00,'Súp thưởng Ciao Churu','pate-ciao-churu-cho-meo',0,'2026-03-10 15:37:32.143255',41,NULL),(19,_binary '',0.0,25000.00,'2026-03-10 15:37:32.194144','Giúp mèo xả stress và vận động',_binary '','Cần câu mèo gắn lông vũ',0,NULL,'Đồ chơi tương tác cho mèo','can-cau-meo-gan-long-vu',0,'2026-03-30 11:57:04.292908',44,NULL),(20,_binary '',0.0,50000.00,'2026-03-10 15:37:32.269221','Chất cotton co giãn thoải mái, nhiều size lựa chọn, mềm mại',_binary '','Áo thun hình thú cho mèo',0,45000.00,'Quần áo giữ ấm cho mèo','ao-thun-hinh-thu-cho-meo',0,'2026-03-30 11:55:54.203800',45,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `review_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_images` (
  `review_id` bigint NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `FK3aayo5bjciyemf3bvvt987hkr` (`review_id`),
  CONSTRAINT `FK3aayo5bjciyemf3bvvt987hkr` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `review_images` WRITE;
/*!40000 ALTER TABLE `review_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_images` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) DEFAULT NULL,
  `hidden` bit(1) NOT NULL,
  `rating` int NOT NULL,
  `reply_at` datetime(6) DEFAULT NULL,
  `shop_reply` text COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime(6) DEFAULT NULL,
  `visible` bit(1) NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `order_item_id` bigint DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_3p9j9vyr1qofbcxju65es206r` (`booking_id`),
  KEY `FK2x2x74lnliqmt91bc1w95ll8n` (`order_item_id`),
  KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`),
  KEY `FKcgy7qjc1r99dp117y9en6lxye` (`user_id`),
  CONSTRAINT `FK28an517hrxtt2bsg93uefugrm` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FK2x2x74lnliqmt91bc1w95ll8n` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `reward_tiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_tiers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_percent` int NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `min_spending` decimal(15,2) NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_c1nw9w6t6lu17l3cysqmwa2fn` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reward_tiers` WRITE;
/*!40000 ALTER TABLE `reward_tiers` DISABLE KEYS */;
INSERT INTO `reward_tiers` VALUES (1,_binary '','#CD7F32','2026-03-15 15:41:26.211372','Chi tiêu từ 500.000đ - Giảm 5% cho đơn tiếp theo',5,'Đồng','?',50000.00,500000.00,'BRONZE',1),(2,_binary '','#C0C0C0','2026-03-15 15:41:26.232158','Chi tiêu từ 2.000.000đ - Giảm 10% cho đơn tiếp theo',10,'Bạc','?',100000.00,2000000.00,'SILVER',2),(3,_binary '','#FFD700','2026-03-15 15:41:26.236458','Chi tiêu từ 5.000.000đ - Giảm 15% cho đơn tiếp theo',15,'Vàng','?',200000.00,5000000.00,'GOLD',3),(4,_binary '','#E5E4E2','2026-03-15 15:41:26.238459','Chi tiêu từ 10.000.000đ - Giảm 20% cho đơn tiếp theo',20,'Bạch Kim','?',500000.00,10000000.00,'PLATINUM',4),(5,_binary '','#B9F2FF','2026-03-15 15:41:26.242300','Chi tiêu từ 20.000.000đ - Giảm 25% cho đơn tiếp theo',25,'Kim Cương','?',1000000.00,20000000.00,'DIAMOND',5);
/*!40000 ALTER TABLE `reward_tiers` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `saved_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `saved_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKry3dcpcip16koacn7n6p0cnca` (`user_id`,`voucher_id`),
  KEY `FKhgg3hndsk8niq6tio7elh0moa` (`voucher_id`),
  CONSTRAINT `FK7g6t2jibsv07b7j07qoyhc1cv` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKhgg3hndsk8niq6tio7elh0moa` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `saved_vouchers` WRITE;
/*!40000 ALTER TABLE `saved_vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `service_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_pricing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `max_weight` double NOT NULL,
  `min_weight` double NOT NULL,
  `pet_type` enum('DOG','CAT','BIRD','FISH','HAMSTER','RABBIT','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `service_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKb9t533oxvpbyv47e6q8phgow3` (`service_id`),
  CONSTRAINT `FKb9t533oxvpbyv47e6q8phgow3` FOREIGN KEY (`service_id`) REFERENCES `spa_services` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `service_pricing` WRITE;
/*!40000 ALTER TABLE `service_pricing` DISABLE KEYS */;
INSERT INTO `service_pricing` VALUES (44,5,0.1,'DOG',150000.00,4),(45,10,5.1,'DOG',200000.00,4),(46,20,10.1,'DOG',280000.00,4),(47,30,20.1,'DOG',350000.00,4),(52,5,0.1,'DOG',450000.00,6),(53,10,5.1,'DOG',580000.00,6),(54,20,10.1,'DOG',720000.00,6),(55,30,20.1,'DOG',900000.00,6),(56,30,0,'DOG',50000.00,8),(57,30,0,'DOG',80000.00,9),(58,5,0.1,'DOG',200000.00,5),(59,10,5.1,'DOG',280000.00,5),(60,20,10.1,'DOG',350000.00,5),(61,30,20.1,'DOG',450000.00,5);
/*!40000 ALTER TABLE `service_pricing` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `spa_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spa_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int DEFAULT NULL,
  `duration` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pet_type` enum('DOG','CAT','BIRD','FISH','OTHER','ALL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_mt1t82xf661i8586022n5sjc2` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `spa_services` WRITE;
/*!40000 ALTER TABLE `spa_services` DISABLE KEYS */;
INSERT INTO `spa_services` VALUES (4,_binary '','2026-03-01 09:46:12.461320','',0,60,'https://phongkhamthuythithipet.com/wp-content/uploads/2024/07/dich-vu-cham-soc-lam-dep-cho-thu-cung.jpg','Tắm Spa toàn thân','ALL','tam-spa-toan-than','2026-03-13 15:09:57.932369'),(5,_binary '','2026-03-01 09:49:13.727616','',0,60,'https://cdn.shopify.com/s/files/1/0624/1746/9697/files/Screenshot_2023-05-19_144223_600x600.png?v=1684482225','Cắt tỉa tạo kiểu','ALL','cat-tia-tao-kieu','2026-03-30 15:18:22.652755'),(6,_binary '','2026-03-01 09:50:36.010735','',0,60,'https://helloconsen.com/wp-content/uploads/2024/10/ef3a943d-3279-4a80-887e-1fe55ac55adb.jpg','Combo Spa cao cấp','ALL','combo-spa-cao-cap','2026-03-13 15:11:16.676974'),(8,_binary '','2026-03-01 09:51:17.399037','',0,60,'https://admin.petpro.com.vn/images/uploaded/Hinh%20Blog/untitled%20folder/me%CC%80o-pha%CC%89n-u%CC%9B%CC%81ng-khi-bi%CC%A3-chu%CC%89-ca%CC%86%CC%81t-mo%CC%81ng.jpg','Cắt móng','ALL','cat-mong','2026-03-13 15:11:50.254574'),(9,_binary '','2026-03-01 09:51:49.437077','',0,60,'https://petcorner.vn/wp-content/uploads/2025/05/Huong-dan-ve-sinh-tai-mat-cho-meo-hang-ngay.jpg','Vệ sinh tai & mắt','ALL','ve-sinh-tai-mat','2026-03-13 15:12:20.361401');
/*!40000 ALTER TABLE `spa_services` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `movement_type` enum('IMPORT','EXPORT_SALE','EXPORT_DAMAGE','EXPORT_RETURN_SUPPLIER','ADJUST_IN','ADJUST_OUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `quantity` int NOT NULL,
  `quantity_after` int NOT NULL,
  `quantity_before` int NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `variant_id` bigint NOT NULL,
  `reference_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtarfmf9jkv9ovq74yswik0gsl` (`created_by`),
  KEY `FK82mrlg9h36kaw5kn90fliqu0b` (`order_id`),
  KEY `FKo3rdw1xgft64g9fr8d3rnbt1q` (`variant_id`),
  CONSTRAINT `FK82mrlg9h36kaw5kn90fliqu0b` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKo3rdw1xgft64g9fr8d3rnbt1q` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`),
  CONSTRAINT `FKtarfmf9jkv9ovq74yswik0gsl` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `user_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_rewards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `spending_at_unlock` decimal(15,2) DEFAULT NULL,
  `unlocked_at` datetime(6) DEFAULT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `voucher_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_used` bit(1) DEFAULT NULL,
  `reward_tier_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK7cw4byeh7i3oafu0w973mwy44` (`user_id`,`reward_tier_id`),
  UNIQUE KEY `UK_1d7ti323nwk0458hxfseh72iq` (`voucher_code`),
  KEY `FKgfkqeyghwnx2b3i8gkb119mp2` (`reward_tier_id`),
  CONSTRAINT `FK4ear62j8k2olcikuil4rye8la` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgfkqeyghwnx2b3i8gkb119mp2` FOREIGN KEY (`reward_tier_id`) REFERENCES `reward_tiers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_rewards` WRITE;
/*!40000 ALTER TABLE `user_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_rewards` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','STAFF','CUSTOMER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,_binary '',NULL,NULL,'2026-02-13 08:26:21.243310','minhphong592004@gmail.com','MinhPhongg','$2a$10$fJ7QnaO5VYp66jT8aKzviuyabzlNpZaY0Jzas7HAKZ/vZv97R9VBO','0987654321','CUSTOMER','2026-03-13 16:12:36.651496'),(5,_binary '','He thong PetShop',NULL,'2026-02-13 09:33:27.702203','admin@petshop.com','Administrator','$2a$10$Q25AbJ8P3nBLo.7QUj2.meqtNEOZb3t15emvy4rlvPnAh25Vv04Mq','0900000000','ADMIN','2026-02-13 09:33:27.702203');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `voucher_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_usage_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `discount_amount` decimal(12,2) DEFAULT NULL,
  `order_amount` decimal(12,2) DEFAULT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7rr1d2phg0v6jkh2blusfgab5` (`order_id`),
  KEY `FKtf62hqrh80cm3sb4wv5ralq8t` (`user_id`),
  KEY `FK9vcno4hvdaaxtvjx29gl2al71` (`voucher_id`),
  CONSTRAINT `FK7rr1d2phg0v6jkh2blusfgab5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK9vcno4hvdaaxtvjx29gl2al71` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
  CONSTRAINT `FKtf62hqrh80cm3sb4wv5ralq8t` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `voucher_usage_logs` WRITE;
/*!40000 ALTER TABLE `voucher_usage_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_usage_logs` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `apply_to` enum('ALL','PRODUCTS','SERVICES') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `min_order_amount` decimal(12,2) DEFAULT NULL,
  `start_date` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `usage_limit_per_user` int DEFAULT NULL,
  `used_count` int DEFAULT NULL,
  `voucher_category` enum('GENERAL','WELCOME','SERVICE','LOYALTY','RECURRING') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_30ftp2biebbvpik8e49wlmady` (`code`),
  KEY `FKg558mlhvp2sjd8runv41xygd3` (`target_user_id`),
  CONSTRAINT `FKg558mlhvp2sjd8runv41xygd3` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (1,_binary '','ALL','THANHVIENMOI','2026-03-30 15:21:44.571020','','PERCENTAGE',20000.00,'2026-04-11 15:21:00.000000',NULL,1.00,'2026-03-30 15:21:00.000000','2026-03-30 15:21:44.571020',20,1,0,'WELCOME',NULL);
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
