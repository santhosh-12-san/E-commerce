"""
ShopNest E-Commerce - Database Seeding Script (Raw SQL / No SQLAlchemy)
Populates the database with 50 diverse, realistic products across categories
with proper stock distributions to demonstrate:
- Out of Stock (stock = 0) -> 5 products
- Only Few Left (stock = 1 or 2) -> 11 products
- In Stock (stock >= 3) -> 34 products
"""

import sys
import os
import json

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.db import db, init_db
from app.auth import get_password_hash
from app.config import settings

PRODUCTS = [
    # -------------------------------------------------------------
    # 1. Electronics - Audio & Headphones (8 products)
    # -------------------------------------------------------------
    {
        "sku": "AUD-SONY-XM5",
        "barcode": "890100100001",
        "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        "brand": "Sony",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 34990.0,
        "selling_price": 26990.0,
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "specifications": json.dumps({
            "Driver Size": "30mm",
            "Battery Life": "30 hours",
            "ANC": "Industry Leading HD QN1",
            "Connectivity": "Bluetooth 5.2",
            "Color": "Silver"
        }),
        "rating": 4.8,
        "rating_count": 520
    },
    {
        "sku": "AUD-APPL-APP2",
        "barcode": "890100100002",
        "name": "Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 24900.0,
        "selling_price": 21990.0,
        "stock": 8,
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
        "specifications": json.dumps({
            "Chip": "Apple H2 Headphone Chip",
            "Audio Technology": "Adaptive Audio, Active Noise Cancellation",
            "Sweat & Water Resistance": "IP54",
            "Charging": "MagSafe / USB-C"
        }),
        "rating": 4.9,
        "rating_count": 840
    },
    {
        "sku": "AUD-BOSE-QC45",
        "barcode": "890100100003",
        "name": "Bose QuietComfort 45 Bluetooth Wireless Headphones",
        "brand": "Bose",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 29900.0,
        "selling_price": 22490.0,
        "stock": 2,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
        "specifications": json.dumps({
            "Battery Life": "22 hours",
            "Modes": "Quiet and Aware Modes",
            "Weight": "240g",
            "Color": "Triple Black"
        }),
        "rating": 4.7,
        "rating_count": 310
    },
    {
        "sku": "AUD-JBL-FLIP6",
        "barcode": "890100100004",
        "name": "JBL Flip 6 Waterproof Portable Bluetooth Speaker",
        "brand": "JBL",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 13999.0,
        "selling_price": 9999.0,
        "stock": 24,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
        "specifications": json.dumps({
            "Output Power": "30W RMS",
            "Playtime": "12 hours",
            "Waterproof Rating": "IP67",
            "Bluetooth": "v5.1"
        }),
        "rating": 4.6,
        "rating_count": 640
    },
    {
        "sku": "AUD-MARS-EMB2",
        "barcode": "890100100005",
        "name": "Marshall Emberton II Compact Portable Wireless Speaker",
        "brand": "Marshall",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 17499.0,
        "selling_price": 14999.0,
        "stock": 1,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
        "specifications": json.dumps({
            "Playtime": "30+ hours",
            "Water Resistance": "IP67",
            "Sound": "True Stereophonic 360°",
            "Weight": "0.7 kg"
        }),
        "rating": 4.8,
        "rating_count": 190
    },
    {
        "sku": "AUD-SENN-MOM4",
        "barcode": "890100100006",
        "name": "Sennheiser Momentum 4 Wireless Audiophile Headphones",
        "brand": "Sennheiser",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 34990.0,
        "selling_price": 27990.0,
        "stock": 0,  # Out of Stock
        "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
        "specifications": json.dumps({
            "Battery Life": "60 hours",
            "Driver": "42mm audiophile-inspired",
            "Codecs": "aptX Adaptive, AAC, SBC",
            "Color": "Matte White"
        }),
        "rating": 4.7,
        "rating_count": 140
    },
    {
        "sku": "AUD-ANKR-Q30",
        "barcode": "890100100007",
        "name": "Anker Soundcore Life Q30 Hybrid Active Noise Cancelling",
        "brand": "Anker",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 9999.0,
        "selling_price": 6499.0,
        "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&q=80",
        "specifications": json.dumps({
            "Battery Life": "40 hours (ANC on)",
            "Modes": "Transport, Outdoor, Indoor",
            "Certification": "Hi-Res Audio",
            "Color": "Midnight Black"
        }),
        "rating": 4.5,
        "rating_count": 410
    },
    {
        "sku": "AUD-BEAT-PRO",
        "barcode": "890100100008",
        "name": "Beats Studio Pro Premium Wireless Over-Ear Headphones",
        "brand": "Beats",
        "category": "Electronics",
        "subcategory": "Audio",
        "mrp": 37900.0,
        "selling_price": 29900.0,
        "stock": 5,
        "image_url": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80",
        "specifications": json.dumps({
            "Acoustic Architecture": "Custom 40mm active drivers",
            "Spatial Audio": "Personalized Spatial Audio with dynamic head tracking",
            "Battery Life": "Up to 40 hours",
            "Color": "Deep Brown"
        }),
        "rating": 4.6,
        "rating_count": 220
    },

    # -------------------------------------------------------------
    # 2. Electronics - Computing & Tech (8 products)
    # -------------------------------------------------------------
    {
        "sku": "TEC-APPL-MBA-M2",
        "barcode": "890100100009",
        "name": "Apple MacBook Air 13.6-inch M2 Chip (8GB RAM, 256GB SSD)",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Computers",
        "mrp": 114900.0,
        "selling_price": 89990.0,
        "stock": 6,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "specifications": json.dumps({
            "Display": "13.6-inch Liquid Retina",
            "Processor": "Apple M2 8-core CPU",
            "Memory": "8GB Unified",
            "Storage": "256GB SSD",
            "Weight": "1.24 kg"
        }),
        "rating": 4.9,
        "rating_count": 780
    },
    {
        "sku": "TEC-DELL-XPS13",
        "barcode": "890100100010",
        "name": "Dell XPS 13 Plus Ultrabook (Intel Core i7 13th Gen, 16GB, 1TB)",
        "brand": "Dell",
        "category": "Electronics",
        "subcategory": "Computers",
        "mrp": 169990.0,
        "selling_price": 142990.0,
        "stock": 2,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
        "specifications": json.dumps({
            "Screen": "13.4-inch 3.5K OLED Touch",
            "RAM": "16GB LPDDR5",
            "Storage": "1TB NVMe SSD",
            "Weight": "1.26 kg"
        }),
        "rating": 4.6,
        "rating_count": 130
    },
    {
        "sku": "TEC-ASUS-G14",
        "barcode": "890100100011",
        "name": "ASUS ROG Zephyrus G14 Gaming Laptop (Ryzen 9, RTX 4060)",
        "brand": "ASUS",
        "category": "Electronics",
        "subcategory": "Computers",
        "mrp": 174990.0,
        "selling_price": 149990.0,
        "stock": 4,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
        "specifications": json.dumps({
            "Display": "14-inch ROG Nebula OLED 120Hz",
            "GPU": "NVIDIA GeForce RTX 4060 8GB",
            "Processor": "AMD Ryzen 9 8945HS",
            "RAM": "16GB DDR5"
        }),
        "rating": 4.8,
        "rating_count": 210
    },
    {
        "sku": "TEC-LOGI-MX3S",
        "barcode": "890100100012",
        "name": "Logitech MX Master 3S Performance Wireless Ergonomic Mouse",
        "brand": "Logitech",
        "category": "Electronics",
        "subcategory": "Accessories",
        "mrp": 10995.0,
        "selling_price": 8495.0,
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        "specifications": json.dumps({
            "Sensor": "8000 DPI Darkfield",
            "Clicks": "Quiet Click Technology",
            "Scroll": "MagSpeed Electromagnetic",
            "Battery": "Up to 70 days per charge"
        }),
        "rating": 4.9,
        "rating_count": 920
    },
    {
        "sku": "TEC-KEYC-K2",
        "barcode": "890100100013",
        "name": "Keychron K2 Wireless Mechanical Keyboard (RGB Backlit Gateron Brown)",
        "brand": "Keychron",
        "category": "Electronics",
        "subcategory": "Accessories",
        "mrp": 9499.0,
        "selling_price": 7999.0,
        "stock": 12,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        "specifications": json.dumps({
            "Layout": "75% Compact (84 keys)",
            "Switches": "Gateron G Pro Brown Tactile",
            "Battery": "4000mAh",
            "Compatibility": "macOS & Windows"
        }),
        "rating": 4.7,
        "rating_count": 340
    },
    {
        "sku": "TEC-SAMS-M8",
        "barcode": "890100100014",
        "name": "Samsung 32-inch 4K UHD Smart Monitor M8 with SlimFit Camera",
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Displays",
        "mrp": 62000.0,
        "selling_price": 44999.0,
        "stock": 7,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
        "specifications": json.dumps({
            "Resolution": "3840 x 2160 UHD",
            "Smart Hub": "Tizen OS with Netflix, YouTube",
            "Connectivity": "USB-C with 65W charging",
            "Color": "Warm White"
        }),
        "rating": 4.6,
        "rating_count": 180
    },
    {
        "sku": "TEC-SAND-1TB",
        "barcode": "890100100015",
        "name": "SanDisk 1TB Extreme Portable External SSD (Up to 1050MB/s)",
        "brand": "SanDisk",
        "category": "Electronics",
        "subcategory": "Storage",
        "mrp": 15500.0,
        "selling_price": 9490.0,
        "stock": 45,
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",
        "specifications": json.dumps({
            "Speed": "1050MB/s Read, 1000MB/s Write",
            "Interface": "USB 3.2 Gen 2",
            "Protection": "IP55 Water & Dust Resistant",
            "Drop Protection": "Up to 2 meters"
        }),
        "rating": 4.8,
        "rating_count": 650
    },
    {
        "sku": "TEC-ANKR-737",
        "barcode": "890100100016",
        "name": "Anker 737 Power Bank (PowerCore 24K, 140W 3-Port Portable Charger)",
        "brand": "Anker",
        "category": "Electronics",
        "subcategory": "Accessories",
        "mrp": 14999.0,
        "selling_price": 11999.0,
        "stock": 0,  # Out of Stock
        "image_url": "https://images.unsplash.com/photo-1609592424383-e847c0aa3ce9?w=800&q=80",
        "specifications": json.dumps({
            "Capacity": "24000mAh",
            "Max Output": "140W Two-Way Fast Charging",
            "Display": "Smart Digital OLED Display",
            "Ports": "2x USB-C, 1x USB-A"
        }),
        "rating": 4.8,
        "rating_count": 390
    },

    # -------------------------------------------------------------
    # 3. Wearables & Smartwatches (5 products)
    # -------------------------------------------------------------
    {
        "sku": "WRB-APPL-W9",
        "barcode": "890100100017",
        "name": "Apple Watch Series 9 GPS 45mm Midnight Aluminum Case",
        "brand": "Apple",
        "category": "Wearables",
        "subcategory": "Smartwatches",
        "mrp": 44900.0,
        "selling_price": 38990.0,
        "stock": 14,
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
        "specifications": json.dumps({
            "Chip": "S9 SiP with 4-core Neural Engine",
            "Display": "Always-On Retina (up to 2000 nits)",
            "Features": "Double tap gesture, Blood Oxygen app, ECG",
            "Water Resistance": "50m"
        }),
        "rating": 4.9,
        "rating_count": 610
    },
    {
        "sku": "WRB-SAMS-GW6",
        "barcode": "890100100018",
        "name": "Samsung Galaxy Watch 6 Bluetooth 44mm Graphite",
        "brand": "Samsung",
        "category": "Wearables",
        "subcategory": "Smartwatches",
        "mrp": 33999.0,
        "selling_price": 24999.0,
        "stock": 9,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "specifications": json.dumps({
            "Display": "1.5-inch Super AMOLED Sapphire Crystal",
            "Sensors": "BioActive Sensor (ECG, Blood Pressure, BIA)",
            "OS": "Wear OS Powered by Samsung",
            "Battery": "425mAh"
        }),
        "rating": 4.6,
        "rating_count": 320
    },
    {
        "sku": "WRB-GARM-FR265",
        "barcode": "890100100019",
        "name": "Garmin Forerunner 265 GPS Running Smartwatch with AMOLED",
        "brand": "Garmin",
        "category": "Wearables",
        "subcategory": "Fitness Trackers",
        "mrp": 50490.0,
        "selling_price": 44990.0,
        "stock": 1,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
        "specifications": json.dumps({
            "Display": "1.3-inch Colorful AMOLED",
            "Battery Life": "Up to 13 days in smartwatch mode",
            "GPS": "Multi-band GNSS with SatIQ",
            "Training Metrics": "Training Readiness, Morning Report, HRV"
        }),
        "rating": 4.8,
        "rating_count": 170
    },
    {
        "sku": "WRB-FITB-CH6",
        "barcode": "890100100020",
        "name": "Fitbit Charge 6 Advanced Fitness and Health Tracker",
        "brand": "Fitbit",
        "category": "Wearables",
        "subcategory": "Fitness Trackers",
        "mrp": 14999.0,
        "selling_price": 11499.0,
        "stock": 20,
        "image_url": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80",
        "specifications": json.dumps({
            "Built-in GPS": "Yes",
            "Heart Rate Tracking": "Enhanced Google Heart Rate Algorithm",
            "Google Apps": "Google Maps, Google Wallet, YouTube Music controls",
            "Battery": "Up to 7 days"
        }),
        "rating": 4.4,
        "rating_count": 280
    },
    {
        "sku": "WRB-AMAZ-GTR4",
        "barcode": "890100100021",
        "name": "Amazfit GTR 4 Smart Watch with Dual-Band GPS & Alexa",
        "brand": "Amazfit",
        "category": "Wearables",
        "subcategory": "Smartwatches",
        "mrp": 21999.0,
        "selling_price": 14999.0,
        "stock": 0,  # Out of Stock
        "image_url": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80",
        "specifications": json.dumps({
            "Display": "1.43-inch HD AMOLED",
            "Sports Modes": "150+ Sports Modes & Strength Exercise Recognition",
            "Battery": "14-day ultra-long battery life",
            "Calls": "Bluetooth Phone Calls"
        }),
        "rating": 4.5,
        "rating_count": 150
    },

    # -------------------------------------------------------------
    # 4. Cameras & Photography (5 products)
    # -------------------------------------------------------------
    {
        "sku": "CAM-SONY-A7M4",
        "barcode": "890100100022",
        "name": "Sony Alpha 7 IV Full-frame Mirrorless Interchangeable Lens Camera",
        "brand": "Sony",
        "category": "Cameras",
        "subcategory": "Mirrorless",
        "mrp": 242990.0,
        "selling_price": 209990.0,
        "stock": 3,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
        "specifications": json.dumps({
            "Sensor": "33MP Full-Frame Exmor R CMOS",
            "Video": "4K 60p 10-bit 4:2:2",
            "Autofocus": "759-point Phase-detection AF",
            "Stabilization": "5-axis In-body Image Stabilization"
        }),
        "rating": 4.9,
        "rating_count": 430
    },
    {
        "sku": "CAM-CANO-R6M2",
        "barcode": "890100100023",
        "name": "Canon EOS R6 Mark II Mirrorless Camera (Body Only)",
        "brand": "Canon",
        "category": "Cameras",
        "subcategory": "Mirrorless",
        "mrp": 250995.0,
        "selling_price": 219990.0,
        "stock": 1,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
        "specifications": json.dumps({
            "Sensor": "24.2MP CMOS Sensor",
            "Shooting Speed": "Up to 40 fps electronic shutter",
            "Video": "6K oversampled uncropped 4K 60p",
            "AF": "Dual Pixel CMOS AF II"
        }),
        "rating": 4.8,
        "rating_count": 190
    },
    {
        "sku": "CAM-DJI-M4P",
        "barcode": "890100100024",
        "name": "DJI Mini 4 Pro Drone Fly More Combo with RC 2 Controller",
        "brand": "DJI",
        "category": "Cameras",
        "subcategory": "Drones",
        "mrp": 125000.0,
        "selling_price": 108990.0,
        "stock": 5,
        "image_url": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80",
        "specifications": json.dumps({
            "Weight": "Under 249 g",
            "Obstacle Sensing": "Omnidirectional Obstacle Sensing",
            "Video": "4K/60fps HDR True Vertical Shooting",
            "Transmission": "20 km FHD Video Transmission"
        }),
        "rating": 4.9,
        "rating_count": 310
    },
    {
        "sku": "CAM-GOPR-H12",
        "barcode": "890100100025",
        "name": "GoPro HERO12 Black Waterproof Action Camera with HDR 5.3K Video",
        "brand": "GoPro",
        "category": "Cameras",
        "subcategory": "Action Cameras",
        "mrp": 45000.0,
        "selling_price": 37990.0,
        "stock": 16,
        "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80",
        "specifications": json.dumps({
            "Video": "5.3K 60 + 4K 120 Resolution",
            "Stabilization": "HyperSmooth 6.0 with 360° Horizon Lock",
            "Waterproof": "Up to 10m (33ft) without housing",
            "Audio": "Bluetooth Audio Support for AirPods"
        }),
        "rating": 4.7,
        "rating_count": 520
    },
    {
        "sku": "CAM-FUJI-X100V",
        "barcode": "890100100026",
        "name": "Fujifilm X100V Premium Compact Camera (Silver)",
        "brand": "Fujifilm",
        "category": "Cameras",
        "subcategory": "Compact Cameras",
        "mrp": 139999.0,
        "selling_price": 129999.0,
        "stock": 0,  # Out of Stock
        "image_url": "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&q=80",
        "specifications": json.dumps({
            "Lens": "Fixed 23mm F2.0 Lens",
            "Sensor": "26.1MP X-Trans CMOS 4",
            "Viewfinder": "Advanced Hybrid Viewfinder (OVF/EVF)",
            "Design": "Aluminum top and bottom plates"
        }),
        "rating": 4.9,
        "rating_count": 680
    },

    # -------------------------------------------------------------
    # 5. Footwear & Shoes (6 products)
    # -------------------------------------------------------------
    {
        "sku": "FOT-NIKE-AF1",
        "barcode": "890100100027",
        "name": "Nike Air Force 1 '07 Classic White Low Top Sneakers",
        "brand": "Nike",
        "category": "Footwear",
        "subcategory": "Sneakers",
        "mrp": 8195.0,
        "selling_price": 7495.0,
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
        "specifications": json.dumps({
            "Upper Material": "Real and synthetic leather",
            "Cushioning": "Nike Air cushioning",
            "Outsole": "Non-marking rubber with pivot circles",
            "Color": "Triple White"
        }),
        "rating": 4.8,
        "rating_count": 890
    },
    {
        "sku": "FOT-ADID-UB",
        "barcode": "890100100028",
        "name": "Adidas Ultraboost Light Performance Running Shoes",
        "brand": "Adidas",
        "category": "Footwear",
        "subcategory": "Running Shoes",
        "mrp": 18999.0,
        "selling_price": 13999.0,
        "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
        "specifications": json.dumps({
            "Midsole": "Light BOOST cushioning (30% lighter)",
            "Upper": "PRIMEKNIT+ textile upper",
            "Outsole": "Continental Better Rubber",
            "Drop": "10 mm"
        }),
        "rating": 4.7,
        "rating_count": 460
    },
    {
        "sku": "FOT-NB-574",
        "barcode": "890100100029",
        "name": "New Balance 574 Core Heritage Lifestyle Sneakers",
        "brand": "New Balance",
        "category": "Footwear",
        "subcategory": "Sneakers",
        "mrp": 9999.0,
        "selling_price": 7499.0,
        "stock": 2,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
        "specifications": json.dumps({
            "Midsole": "ENCAP cushioning with lightweight EVA",
            "Upper": "Suede and mesh upper",
            "Style": "Classic retro runner",
            "Color": "Grey with White"
        }),
        "rating": 4.6,
        "rating_count": 370
    },
    {
        "sku": "FOT-PUMA-RSX",
        "barcode": "890100100030",
        "name": "Puma RS-X Reinvention Bulky Chunky Retro Sneakers",
        "brand": "Puma",
        "category": "Footwear",
        "subcategory": "Sneakers",
        "mrp": 8999.0,
        "selling_price": 5999.0,
        "stock": 11,
        "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
        "specifications": json.dumps({
            "Technology": "Running System (RS) retro cushioning",
            "Upper": "Mesh upper with leather and suede overlays",
            "Closure": "Full lace closure",
            "Color": "White / Royal High Risk Red"
        }),
        "rating": 4.5,
        "rating_count": 250
    },
    {
        "sku": "FOT-ON-CL5",
        "barcode": "890100100031",
        "name": "On Running Cloud 5 Lightweight All-Day Comfort Shoes",
        "brand": "On Running",
        "category": "Footwear",
        "subcategory": "Running Shoes",
        "mrp": 14999.0,
        "selling_price": 12499.0,
        "stock": 1,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "specifications": json.dumps({
            "Cushioning": "CloudTec in Zero-Gravity foam",
            "Lacing": "Speed-lacing system",
            "Sustainability": "44% recycled content",
            "Weight": "250g"
        }),
        "rating": 4.8,
        "rating_count": 310
    },
    {
        "sku": "FOT-CONV-AS",
        "barcode": "890100100032",
        "name": "Converse Chuck Taylor All Star Classic High Top Canvas Shoes",
        "brand": "Converse",
        "category": "Footwear",
        "subcategory": "Sneakers",
        "mrp": 4999.0,
        "selling_price": 3799.0,
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80",
        "specifications": json.dumps({
            "Upper": "Lightweight durable canvas",
            "Medial Eyelets": "Enhance airflow",
            "Ankle Patch": "Classic All Star ankle patch",
            "Color": "Black Canvas"
        }),
        "rating": 4.7,
        "rating_count": 990
    },

    # -------------------------------------------------------------
    # 6. Fashion, Apparel & Accessories (7 products)
    # -------------------------------------------------------------
    {
        "sku": "FAS-LEVI-501",
        "barcode": "890100100033",
        "name": "Levi's 501 Original Fit Straight Leg Denim Jeans",
        "brand": "Levi's",
        "category": "Fashion",
        "subcategory": "Men's Clothing",
        "mrp": 4999.0,
        "selling_price": 3299.0,
        "stock": 35,
        "image_url": "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80",
        "specifications": json.dumps({
            "Fit": "Regular straight leg fit",
            "Fabric": "100% Cotton Heavyweight Denim",
            "Closure": "Signature button fly",
            "Wash": "Stonewash Medium Indigo"
        }),
        "rating": 4.6,
        "rating_count": 560
    },
    {
        "sku": "FAS-PATA-SWT",
        "barcode": "890100100034",
        "name": "Patagonia Better Sweater 1/4-Zip Recycled Fleece Jacket",
        "brand": "Patagonia",
        "category": "Fashion",
        "subcategory": "Men's Clothing",
        "mrp": 14500.0,
        "selling_price": 11990.0,
        "stock": 8,
        "image_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        "specifications": json.dumps({
            "Material": "100% recycled polyester sweater-knit fleece",
            "Dye Process": "Low-impact dye process saving water and energy",
            "Fair Trade": "Fair Trade Certified sewn",
            "Color": "Stonewash Grey"
        }),
        "rating": 4.9,
        "rating_count": 290
    },
    {
        "sku": "FAS-TNF-RES2",
        "barcode": "890100100035",
        "name": "The North Face Resolve 2 Waterproof Windproof Hooded Jacket",
        "brand": "The North Face",
        "category": "Fashion",
        "subcategory": "Men's Clothing",
        "mrp": 12999.0,
        "selling_price": 9999.0,
        "stock": 2,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80",
        "specifications": json.dumps({
            "Technology": "DryVent 2L waterproof, breathable, seam-sealed",
            "Wind Protection": "100% windproof fabric",
            "Hood": "Attached adjustable hood stows in collar",
            "Color": "Asphalt Grey / TNF Black"
        }),
        "rating": 4.7,
        "rating_count": 210
    },
    {
        "sku": "FAS-RAYB-WAYF",
        "barcode": "890100100036",
        "name": "Ray-Ban Original Wayfarer Classic Polarized Sunglasses",
        "brand": "Ray-Ban",
        "category": "Fashion",
        "subcategory": "Eyewear",
        "mrp": 11590.0,
        "selling_price": 8990.0,
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        "specifications": json.dumps({
            "Frame Material": "Acetate polished black",
            "Lenses": "G-15 Green Crystal Polarized",
            "UV Protection": "100% UV Protection filter",
            "Size": "Standard 50mm"
        }),
        "rating": 4.8,
        "rating_count": 680
    },
    {
        "sku": "FAS-FOSS-GRNT",
        "barcode": "890100100037",
        "name": "Fossil Grant Chronograph Luggage Brown Leather Watch",
        "brand": "Fossil",
        "category": "Fashion",
        "subcategory": "Watches",
        "mrp": 13495.0,
        "selling_price": 8995.0,
        "stock": 7,
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
        "specifications": json.dumps({
            "Case Size": "44mm stainless steel",
            "Movement": "Quartz Chronograph with Roman numerals",
            "Strap": "Genuine Luggage Brown leather strap",
            "Water Resistance": "5 ATM (50m)"
        }),
        "rating": 4.5,
        "rating_count": 340
    },
    {
        "sku": "FAS-HERS-LTAM",
        "barcode": "890100100038",
        "name": "Herschel Little America Mountaineering 25L Travel Backpack",
        "brand": "Herschel",
        "category": "Fashion",
        "subcategory": "Bags",
        "mrp": 12999.0,
        "selling_price": 8999.0,
        "stock": 22,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        "specifications": json.dumps({
            "Capacity": "25 Liters",
            "Laptop Sleeve": "Padded and fleece-lined 15-inch sleeve",
            "Straps": "Contoured shoulder straps with air mesh padding",
            "Color": "Raven Crosshatch / Black"
        }),
        "rating": 4.7,
        "rating_count": 420
    },
    {
        "sku": "FAS-BELL-SLIM",
        "barcode": "890100100039",
        "name": "Bellroy Slim Sleeve Premium Eco-Tanned Leather Bi-fold Wallet",
        "brand": "Bellroy",
        "category": "Fashion",
        "subcategory": "Accessories",
        "mrp": 7500.0,
        "selling_price": 5990.0,
        "stock": 0,  # Out of Stock
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
        "specifications": json.dumps({
            "Card Capacity": "Holds 4 - 11+ cards and folded bills",
            "Material": "Environmentally certified premium leather",
            "Profile": "Ultra-slim 95mm x 80mm profile",
            "Color": "Toffee Brown"
        }),
        "rating": 4.8,
        "rating_count": 380
    },

    # -------------------------------------------------------------
    # 7. Home & Kitchen (7 products)
    # -------------------------------------------------------------
    {
        "sku": "HOM-NESP-VPOP",
        "barcode": "890100100040",
        "name": "Nespresso Vertuo Pop Automatic Single-Serve Coffee Machine",
        "brand": "Nespresso",
        "category": "Home & Kitchen",
        "subcategory": "Coffee Makers",
        "mrp": 17999.0,
        "selling_price": 14490.0,
        "stock": 10,
        "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
        "specifications": json.dumps({
            "Technology": "Centrifusion extraction technology (4000 rpm)",
            "Cup Sizes": "4 sizes: Espresso, Double Espresso, Gran Lungo, Mug",
            "Heat-up Time": "30 seconds",
            "Color": "Coconut White"
        }),
        "rating": 4.7,
        "rating_count": 450
    },
    {
        "sku": "HOM-PHIL-AFXXL",
        "barcode": "890100100041",
        "name": "Philips Digital Airfryer XXL 1.4kg with Fat Removal Tech",
        "brand": "Philips",
        "category": "Home & Kitchen",
        "subcategory": "Kitchen Appliances",
        "mrp": 19995.0,
        "selling_price": 13990.0,
        "stock": 12,
        "image_url": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80",
        "specifications": json.dumps({
            "Capacity": "1.4 kg / 7.3 Liters (XXL family size)",
            "Technology": "Twin TurboStar Rapid Air Technology",
            "Presets": "5 preset cooking programs with Keep Warm mode",
            "Power": "2225 Watts"
        }),
        "rating": 4.8,
        "rating_count": 780
    },
    {
        "sku": "HOM-INST-DUO7",
        "barcode": "890100100042",
        "name": "Instant Pot Duo 7-in-1 Multi-Use Electric Pressure Cooker 6L",
        "brand": "Instant Pot",
        "category": "Home & Kitchen",
        "subcategory": "Kitchen Appliances",
        "mrp": 12999.0,
        "selling_price": 8499.0,
        "stock": 19,
        "image_url": "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&q=80",
        "specifications": json.dumps({
            "Functions": "Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer",
            "Capacity": "6 Liters (serves up to 6 people)",
            "Safety": "10+ proven safety features with lid lock",
            "Inner Pot": "Food grade 304 stainless steel"
        }),
        "rating": 4.9,
        "rating_count": 1120
    },
    {
        "sku": "HOM-DYSO-V12",
        "barcode": "890100100043",
        "name": "Dyson V12 Detect Slim Cordless Vacuum Cleaner with Laser",
        "brand": "Dyson",
        "category": "Home & Kitchen",
        "subcategory": "Vacuums",
        "mrp": 55900.0,
        "selling_price": 47900.0,
        "stock": 4,
        "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
        "specifications": json.dumps({
            "Suction Power": "150 AW powerful suction",
            "Run Time": "Up to 60 minutes fade-free power",
            "Filtration": "Whole-machine filtration traps 99.99% particles",
            "Weight": "Ultra-lightweight 2.2 kg"
        }),
        "rating": 4.9,
        "rating_count": 410
    },
    {
        "sku": "HOM-FELL-EKG",
        "barcode": "890100100044",
        "name": "Fellow Stagg EKG Electric Gooseneck Pour-Over Coffee Kettle 0.9L",
        "brand": "Fellow",
        "category": "Home & Kitchen",
        "subcategory": "Coffee Makers",
        "mrp": 19999.0,
        "selling_price": 16999.0,
        "stock": 2,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
        "specifications": json.dumps({
            "Temperature Control": "To-the-degree PID temperature control (135°F-212°F)",
            "Spout": "Precision fluted gooseneck pour spout",
            "Screen": "LCD screen displaying target and real-time temp",
            "Hold Mode": "60-minute temperature hold"
        }),
        "rating": 4.8,
        "rating_count": 230
    },
    {
        "sku": "HOM-NINJ-BL610",
        "barcode": "890100100045",
        "name": "Ninja Professional Plus 1000W High-Speed Kitchen Blender",
        "brand": "Ninja",
        "category": "Home & Kitchen",
        "subcategory": "Kitchen Appliances",
        "mrp": 11999.0,
        "selling_price": 8999.0,
        "stock": 14,
        "image_url": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80",
        "specifications": json.dumps({
            "Power": "1000-Peak-Watt Motor base",
            "Pitcher": "72 oz Total Crushing Pitcher",
            "Blades": "6-blade Total Crushing Assembly",
            "Speeds": "3 Manual Speeds, Pulse & Single-Serve"
        }),
        "rating": 4.7,
        "rating_count": 510
    },
    {
        "sku": "HOM-LECR-DO24",
        "barcode": "890100100046",
        "name": "Le Creuset Enameled Cast Iron Signature Round Dutch Oven 4.5 Qt",
        "brand": "Le Creuset",
        "category": "Home & Kitchen",
        "subcategory": "Cookware",
        "mrp": 34500.0,
        "selling_price": 28900.0,
        "stock": 1,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80",
        "specifications": json.dumps({
            "Material": "Enameled Cast Iron for superior heat retention",
            "Capacity": "4.5 Quarts (4.2 Liters)",
            "Heat Resistance": "Oven safe up to 500°F (260°C)",
            "Color": "Cerise Cherry Red"
        }),
        "rating": 4.9,
        "rating_count": 330
    },

    # -------------------------------------------------------------
    # 8. Personal Care, Grooming & Gaming (4 products)
    # -------------------------------------------------------------
    {
        "sku": "GRO-PHIL-S9000",
        "barcode": "890100100047",
        "name": "Philips Norelco Series 9000 Wet & Dry Electric Shaver",
        "brand": "Philips",
        "category": "Beauty & Personal Care",
        "subcategory": "Shaving & Grooming",
        "mrp": 21995.0,
        "selling_price": 16999.0,
        "stock": 16,
        "image_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80",
        "specifications": json.dumps({
            "Blades": "Dual SteelPrecision self-sharpening blades",
            "Sensor": "SkinIQ Protective SkinGlide coating",
            "Motion Sensor": "Motion Control guidance via GroomTribe App",
            "Battery": "60 minutes cordless shaving per 1 hour charge"
        }),
        "rating": 4.7,
        "rating_count": 390
    },
    {
        "sku": "GRO-DYSO-SUPER",
        "barcode": "890100100048",
        "name": "Dyson Supersonic Hair Dryer with Intelligent Heat Control",
        "brand": "Dyson",
        "category": "Beauty & Personal Care",
        "subcategory": "Hair Care",
        "mrp": 39900.0,
        "selling_price": 34900.0,
        "stock": 3,
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        "specifications": json.dumps({
            "Motor": "Dyson digital motor V9 (110,000 rpm)",
            "Heat Control": "Measures air temperature 40 times a second",
            "Attachments": "5 magnetic styling attachments including Flyaway tool",
            "Color": "Iron / Fuchsia"
        }),
        "rating": 4.9,
        "rating_count": 720
    },
    {
        "sku": "GRO-BRAU-S8",
        "barcode": "890100100049",
        "name": "Braun Series 8 Electric Razor with SmartClean Charging Center",
        "brand": "Braun",
        "category": "Beauty & Personal Care",
        "subcategory": "Shaving & Grooming",
        "mrp": 26999.0,
        "selling_price": 19999.0,
        "stock": 2,  # Only Few Left
        "image_url": "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=800&q=80",
        "specifications": json.dumps({
            "Sonic Technology": "10,000 micro-vibrations capture more hair",
            "Head": "40° adapting head with floating blades",
            "Battery": "Li-Ion battery with 60 min runtime",
            "Cleaning": "5-in-1 SmartCare Center included"
        }),
        "rating": 4.6,
        "rating_count": 240
    },
    {
        "sku": "GAM-SONY-PS5",
        "barcode": "890100100050",
        "name": "Sony PlayStation 5 Slim Console (1TB SSD, DualSense Wireless)",
        "brand": "Sony",
        "category": "Electronics",
        "subcategory": "Gaming",
        "mrp": 54990.0,
        "selling_price": 49990.0,
        "stock": 8,
        "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
        "specifications": json.dumps({
            "Storage": "1TB Custom High-Speed NVMe SSD",
            "Output": "4K 120Hz, 8K output, HDR support",
            "Audio": "Tempest 3D AudioTech",
            "Controller": "DualSense with Haptic Feedback and Adaptive Triggers"
        }),
        "rating": 4.9,
        "rating_count": 1450
    }
]

def seed():
    print("=" * 60)
    print("ShopNest E-Commerce: Seeding Database (Native Raw SQL)")
    print(f"Target Database: {'PostgreSQL' if db.use_postgres else 'SQLite fallback'}")
    print("=" * 60)

    # 1. Initialize Tables and Indexes
    init_db()

    # 2. Ensure Admin User Exists
    admin_user = db.fetch_one("SELECT id, username FROM users WHERE username = %s", ("admin",))
    if not admin_user:
        hashed = get_password_hash("admin123")
        db.execute(
            "INSERT INTO users (username, hashed_password, role) VALUES (%s, %s, %s)",
            ("admin", hashed, "admin")
        )
        print("[OK] Created default admin user ('admin' / 'admin123')")
    else:
        print("[OK] Verified default admin user exists")

    # 3. Insert 50 Products
    inserted_count = 0
    updated_count = 0

    for p in PRODUCTS:
        existing = db.fetch_one("SELECT id FROM products WHERE sku = %s", (p["sku"],))
        if existing:
            # Update product
            db.execute(
                """
                UPDATE products SET
                    barcode = %s,
                    name = %s,
                    brand = %s,
                    category = %s,
                    subcategory = %s,
                    mrp = %s,
                    selling_price = %s,
                    stock = %s,
                    image_url = %s,
                    specifications = %s,
                    rating = %s,
                    rating_count = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE sku = %s
                """,
                (
                    p["barcode"], p["name"], p["brand"], p["category"],
                    p["subcategory"], p["mrp"], p["selling_price"],
                    p["stock"], p["image_url"], p["specifications"],
                    p["rating"], p["rating_count"], p["sku"]
                )
            )
            updated_count += 1
        else:
            # Insert product
            db.execute(
                """
                INSERT INTO products (
                    sku, barcode, name, brand, category, subcategory,
                    mrp, selling_price, stock, image_url, specifications,
                    rating, rating_count
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    p["sku"], p["barcode"], p["name"], p["brand"], p["category"],
                    p["subcategory"], p["mrp"], p["selling_price"],
                    p["stock"], p["image_url"], p["specifications"],
                    p["rating"], p["rating_count"]
                )
            )
            inserted_count += 1

    total_in_db = db.fetch_one("SELECT COUNT(*) as cnt FROM products")["cnt"]

    print("\n" + "-" * 60)
    print(f"Seeding completed successfully!")
    print(f"  - Newly Inserted: {inserted_count}")
    print(f"  - Updated:        {updated_count}")
    print(f"  - Total Products: {total_in_db}")
    print("-" * 60)

    # Summary of stock distribution
    out_of_stock = db.fetch_one("SELECT COUNT(*) as cnt FROM products WHERE stock = 0")["cnt"]
    few_left = db.fetch_one("SELECT COUNT(*) as cnt FROM products WHERE stock IN (1, 2)")["cnt"]
    in_stock = db.fetch_one("SELECT COUNT(*) as cnt FROM products WHERE stock >= 3")["cnt"]

    print(f"Stock Rules Breakdown in Database:")
    print(f"  [Out of Stock]  (stock = 0):     {out_of_stock} products (Disabled Add-to-Cart)")
    print(f"  [Only Few Left] (stock = 1 or 2): {few_left} products (Enabled Purchase)")
    print(f"  [In Stock]      (stock >= 3):    {in_stock} products (Enabled Purchase)")
    print("=" * 60)

if __name__ == "__main__":
    seed()
