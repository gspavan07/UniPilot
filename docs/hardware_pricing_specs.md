# UNIPILOT: HARDWARE & PRICING SPECIFICATIONS

**Document Type:** Technical & Financial Reference Sheet  
**Origin:** UniPilot Solutions, Kakinada, Andhra Pradesh  
**Valid Until:** February 15, 2026

---

## SECTION 1: HARDWARE REQUIREMENTS

### Infrastructure Specifications (All Tiers)

#### Tier 1: Small College / Diploma Institute

**Target**: Up to 800 Active Users (Students + Faculty + Staff)

| Component    | Recommended Setup           | Best-Case Setup             |
| :----------- | :-------------------------- | :-------------------------- |
| **CPU**      | 4 vCPU / 4 Physical Cores   | 8 vCPU / 8 Physical Cores   |
| **RAM**      | 8GB DDR4                    | 16GB DDR4                   |
| **Storage**  | 100GB SSD                   | 250GB NVMe SSD              |
| **Network**  | 100 Mbps Dedicated          | 1 Gbps Dedicated            |
| **OS**       | Ubuntu 22.04 LTS or RHEL 8+ | Ubuntu 22.04 LTS or RHEL 8+ |
| **Database** | PostgreSQL 15+              | PostgreSQL 15+              |

---

#### Tier 2: Standard Engineering College

**Target**: 1,000 - 3,500 Active Users

| Component    | Recommended Setup           | Best-Case Setup                   |
| :----------- | :-------------------------- | :-------------------------------- |
| **CPU**      | 8 vCPU / 8 Physical Cores   | 16 vCPU / 16 Physical Cores       |
| **RAM**      | 16GB DDR4                   | 32GB DDR4                         |
| **Storage**  | 500GB SSD                   | 1TB NVMe SSD                      |
| **Network**  | 500 Mbps Dedicated          | 1 Gbps Dedicated                  |
| **OS**       | Ubuntu 22.04 LTS or RHEL 8+ | Ubuntu 22.04 LTS or RHEL 8+       |
| **Database** | PostgreSQL 15+              | PostgreSQL 15+ (with replication) |
| **Backup**   | 500GB External/Cloud Backup | 1TB Automated Backup Solution     |

---

#### Tier 3: University / Large Enterprise

**Target**: Unlimited Users (Total Institutional Volume)

| Component         | Recommended Setup           | Best-Case Setup                       |
| :---------------- | :-------------------------- | :------------------------------------ |
| **CPU**           | 16 vCPU / 16 Physical Cores | 32+ vCPU / 32+ Physical Cores         |
| **RAM**           | 32GB DDR4                   | 64GB+ DDR4 ECC                        |
| **Storage**       | 1TB NVMe SSD                | 2TB+ NVMe SSD (RAID 10)               |
| **Network**       | 1 Gbps Dedicated            | 10 Gbps Dedicated                     |
| **OS**            | Ubuntu 22.04 LTS or RHEL 8+ | Ubuntu 22.04 LTS or RHEL 8+           |
| **Database**      | PostgreSQL 15+ (HA Config)  | PostgreSQL 15+ (Master-Slave Cluster) |
| **Backup**        | 1TB Automated Daily Backup  | 2TB+ Real-time Replication            |
| **Load Balancer** | Optional                    | Nginx/HAProxy for High Availability   |

---

## SECTION 2: DETAILED PRICING BREAKDOWN

### Tier 1: Small College (Up to 800 Users)

#### One-time Costs

| Item                    | Description                                        | Amount (INR) |
| :---------------------- | :------------------------------------------------- | :----------- |
| Setup & Installation    | Server configuration, Docker deployment, SSL setup | ₹50,000      |
| Data Migration          | Basic import from Excel/CSV (Current year only)    | No Charge    |
| Branding                | College logo, color scheme customization           | ₹10,000      |
| Initial Training        | 3 days remote training (Admin + 2 Faculty)         | ₹15,000      |
| **Subtotal (One-time)** |                                                    | **₹75,000**  |

#### Annual Recurring Costs

| Item                  | Description                                 | Amount (INR)  |
| :-------------------- | :------------------------------------------ | :------------ |
| Software License      | Annual platform access                      | ₹1,00,000     |
| AMC (Maintenance)     | Updates, security patches, bug fixes        | Included      |
| Technical Support     | Email/Ticket support (9 AM - 6 PM, Mon-Sat) | Included      |
| **Subtotal (Annual)** |                                             | **₹1,00,000** |

#### Optional Services (Tier 1)

| Item                  | Cost Model    |
| :-------------------- | :------------ |
| Managed Cloud Hosting | ₹3,000/month  |
| SMS Gateway           | ₹0.20 per SMS |
| Additional Training   | ₹5,000/day    |

---

### Tier 2: Standard Engineering College (Up to 3,500 Users)

#### One-time Costs

| Item                    | Description                                | Amount (INR)  |
| :---------------------- | :----------------------------------------- | :------------ |
| Setup & Installation    | HA Docker deployment, Load balancer config | ₹80,000       |
| Data Migration          | Full historical data import (Multi-year)   | ₹30,000       |
| Custom Integrations     | JNTU/APSCHE API integration                | ₹40,000       |
| Branding                | Full white-label (Web + Mobile apps)       | ₹25,000       |
| Initial Training        | 5 days on-site (All departments)           | ₹30,000       |
| **Subtotal (One-time)** |                                            | **₹2,05,000** |

#### Annual Recurring Costs

| Item                  | Description                          | Amount (INR)  |
| :-------------------- | :----------------------------------- | :------------ |
| Software License      | Professional tier access             | ₹3,50,000     |
| AMC (Maintenance)     | Priority updates (15% of license)    | ₹52,500       |
| Technical Support     | 12-hour response time, phone support | Included      |
| Mobile App Updates    | iOS + Android quarterly updates      | Included      |
| **Subtotal (Annual)** |                                      | **₹4,02,500** |

#### Optional Services (Tier 2)

| Item                  | Cost Model                     |
| :-------------------- | :----------------------------- |
| Managed Cloud Hosting | ₹6,000/month                   |
| SMS Gateway           | ₹0.18 per SMS (bulk rates)     |
| Payment Gateway       | 1.8% per transaction           |
| Biometric Integration | ₹25,000 one-time + ₹5,000/year |

---

### Tier 3: University / Enterprise (Unlimited Users)

#### One-time Costs

| Item                    | Description                                  | Amount (INR)  |
| :---------------------- | :------------------------------------------- | :------------ |
| Enterprise Setup        | High-availability cluster, redundancy config | ₹1,50,000     |
| Infrastructure Audit    | Pre-deployment server assessment             | ₹30,000       |
| Data Migration          | Unlimited historical + legacy system import  | ₹1,00,000     |
| Custom Development      | Institution-specific modules/features        | ₹70,000       |
| API Gateway Setup       | Custom integrations (ERP, Tally, etc.)       | ₹50,000       |
| Branding & White-label  | Complete institutional branding              | ₹40,000       |
| Initial Training        | 10 days on-site (All staff)                  | ₹80,000       |
| Documentation           | Custom user manuals                          | ₹20,000       |
| **Subtotal (One-time)** |                                              | **₹5,40,000** |

#### Annual Recurring Costs

| Item                  | Description                            | Amount (INR)  |
| :-------------------- | :------------------------------------- | :------------ |
| Enterprise License    | Unlimited user access                  | ₹7,50,000     |
| Priority AMC          | 20% - Dedicated support team           | ₹1,50,000     |
| Technical Support     | 4-hour critical response, 24/7 hotline | Included      |
| Quarterly Reviews     | On-site performance audit              | Included      |
| Feature Updates       | Custom feature requests (2 per year)   | Included      |
| **Subtotal (Annual)** |                                        | **₹9,00,000** |

#### Optional Services (Tier 3)

| Item                      | Cost Model                             |
| :------------------------ | :------------------------------------- |
| Managed Hosting (HA)      | ₹12,000/month                          |
| Dedicated Account Manager | ₹1,50,000/year                         |
| Custom Development Hours  | ₹3,000/hour (beyond included features) |
| Advanced Analytics        | ₹75,000/year                           |
| Multi-campus Module       | ₹2,00,000/year                         |

---

## SECTION 3: ADDITIONAL CHARGES & PASS-THROUGH COSTS

### Communication Services (All Tiers)

- **SMS Gateway**: ₹0.18 - ₹0.22 per DLT-approved SMS
- **Email Service**: ₹8 - ₹10 per 1,000 emails (AWS SES/SendGrid)
- **WhatsApp Business API**: ₹0.50 per message (if opted)

### Payment Gateway Integration

- **Setup**: No Charge
- **Transaction Fee**: 1.8% - 2% (Charged by Razorpay/PhonePe/CCAvenue)

### Compliance & Certifications

- **NAAC/NBA Report Generation**: Included in all tiers
- **ISO Certification Support**: ₹50,000 (one-time consultation)

---

## SECTION 4: GENERAL TERMS

1. **Taxes**: All prices are exclusive of 18% GST
2. **Payment Terms**: 50% advance, 50% on Go-Live
3. **Validity**: Prices valid for 30 days from date of proposal
4. **Renewal**: Annual fees subject to 5% yearly increment
5. **Jurisdiction**: Kakinada, Andhra Pradesh

---

**Document Issued By:**  
UniPilot Solutions  
Kakinada, Andhra Pradesh  
Date: January 15, 2026
