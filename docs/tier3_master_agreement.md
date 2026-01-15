# MASTER SERVICE AGREEMENT

## TIER 3: ENTERPRISE UNIVERSITY MANAGEMENT SYSTEM

**AGREEMENT DATE:** January 15, 2026  
**AGREEMENT NO.:** MSA-UP-T3-2026-001

---

## PARTIES TO THIS AGREEMENT

**SERVICE PROVIDER:**  
UniPilot Solutions  
[Complete Address]  
Kakinada, Andhra Pradesh - 533001  
GSTIN: [GST Number]  
PAN: [PAN Number]

**CLIENT:**  
[Client Institution Name]  
[Complete Address]  
[City, State - PIN]  
GSTIN: [Client GST Number]  
PAN: [Client PAN Number]

(Hereinafter referred to as "Service Provider" and "Client" respectively, and collectively as "Parties")

---

## ARTICLE 1: DEFINITIONS

1.1 **"Software"** means the UniPilot University Management System including all modules, features, and updates.

1.2 **"Instance"** means the dedicated, isolated deployment of the Software on Client's infrastructure.

1.3 **"AMC"** means Annual Maintenance Contract covering updates, patches, and technical support.

1.4 **"Go-Live Date"** means the date on which the Software becomes operational for production use.

1.5 **"Confidential Information"** includes but is not limited to student data, financial records, system architecture, and proprietary modules.

1.6 **"Critical Issue"** means a system failure that prevents normal operations affecting 50% or more users.

---

## ARTICLE 2: SCOPE OF SERVICES

### 2.1 Software License

Service Provider grants Client a **perpetual, non-exclusive, non-transferable license** to use the UniPilot Software for its internal operations. This license covers:

- Unlimited user accounts (Total Institutional Volume)
- All standard and enterprise modules
- Web and mobile applications (iOS & Android)
- API access for custom integrations

### 2.2 Implementation Services

Service Provider shall provide:

- Server setup and Docker containerization
- Database installation (PostgreSQL 15+)
- Complete data migration from legacy systems
- Custom branding and white-labeling
- Third-party API integrations (Payment, SMS, etc.)
- User training (10 days on-site)
- Documentation and user manuals

### 2.3 Annual Maintenance & Support

Service Provider shall provide:

- **24/7 Technical Support** via phone, email, and ticketing system
- **Priority Issue Resolution** (4-hour response for critical issues)
- **Security Patches** applied monthly
- **Feature Updates** quarterly major releases
- **Regulatory Updates** for APSCHE, JNTU, NAAC, NBA templates
- **Quarterly On-site Reviews** for performance audits
- **Custom Development** (up to 2 feature requests per year)

---

## ARTICLE 3: CLIENT OBLIGATIONS

### 3.1 Infrastructure Provision

Client shall provide and maintain:

**Minimum Hardware:**

- 16 vCPU / 16 Physical Cores
- 32GB DDR4 RAM
- 1TB NVMe SSD Storage
- 1 Gbps Network Connectivity
- UPS Backup for uninterrupted power

**Recommended Hardware:**

- 32+ vCPU / 32+ Physical Cores
- 64GB+ DDR4 ECC RAM
- 2TB+ NVMe SSD (RAID 10)
- 10 Gbps Network Connectivity
- Redundant Power Supply

### 3.2 Data Backup

Client is responsible for:

- Regular automated backups (daily minimum)
- Off-site backup storage
- Disaster recovery planning
- Backup testing (quarterly minimum)

Service Provider will provide backup scripts and configuration assistance.

### 3.3 Access & Cooperation

Client shall provide:

- Timely access to servers and systems
- Designated IT point of contact
- Accurate data for migration
- Cooperation during training sessions

---

## ARTICLE 4: FINANCIAL TERMS

### 4.1 Implementation Charges (One-Time)

| Item                       | Amount (INR)  |
| :------------------------- | :------------ |
| Enterprise Setup           | ₹1,50,000     |
| Infrastructure Audit       | ₹30,000       |
| Data Migration             | ₹1,00,000     |
| Custom Development         | ₹70,000       |
| API Integrations           | ₹50,000       |
| White-label Branding       | ₹40,000       |
| Training & Onboarding      | ₹80,000       |
| Documentation              | ₹20,000       |
| **Total Implementation**   | **₹5,40,000** |
| **GST @18%**               | **₹97,200**   |
| **Grand Total (One-time)** | **₹6,37,200** |

### 4.2 Annual Recurring Charges

| Item                     | Amount (INR)   |
| :----------------------- | :------------- |
| Enterprise License       | ₹7,50,000      |
| Priority AMC (20%)       | ₹1,50,000      |
| **Total Annual**         | **₹9,00,000**  |
| **GST @18%**             | **₹1,62,000**  |
| **Grand Total (Annual)** | **₹10,62,000** |

### 4.3 Payment Schedule

**Implementation Phase:**

- 40% on Agreement signing: ₹2,54,880
- 30% on UAT completion: ₹1,91,160
- 30% on Go-Live: ₹1,91,160

**Annual Renewal:**

- Payable 30 days before license expiry
- Late payment attracts 2% monthly interest
- Services suspended after 30-day grace period

### 4.4 Price Escalation

Annual fees subject to 5% increment each year to account for inflation and enhanced features.

---

## ARTICLE 5: DATA OWNERSHIP & PRIVACY

### 5.1 Data Sovereignty

- Client retains **100% ownership** of all data uploaded to the system
- All data resides exclusively in Client's infrastructure (on-premise or private cloud)
- Service Provider does not maintain any copies of production data

### 5.2 Data Access

- Service Provider may access Client data **only for support purposes**
- Access requires explicit written consent from Client
- All access sessions logged and auditable
- Access limited to authorized technical personnel only

### 5.3 Data Security

Service Provider commits to:

- AES-256 encryption for sensitive data at rest
- TLS 1.3 for all data in transit
- Regular vulnerability assessments (quarterly)
- Compliance with IT Act 2000 and DPDP Act 2023

---

## ARTICLE 6: INTELLECTUAL PROPERTY RIGHTS

### 6.1 Software Ownership

- UniPilot Software and source code remain exclusive property of Service Provider
- Client receives usage rights only, not ownership rights
- Client may not reverse engineer, decompile, or modify source code

### 6.2 Custom Development

- Custom modules developed specifically for Client become Client's property
- Service Provider retains right to reuse generic components

### 6.3 Branding

- Client receives white-labeled version with their institutional branding
- Client may not rebrand or resell the software to third parties

---

## ARTICLE 7: SERVICE LEVEL AGREEMENT (SLA)

### 7.1 System Availability

- **99.9% Uptime Guarantee** (for Service Provider managed hosting)
- Excluding scheduled maintenance windows
- Monthly uptime reports provided

### 7.2 Support Response Times

| Priority | Response Time | Resolution Time |
| :------- | :------------ | :-------------- |
| Critical | 4 hours       | 24 hours        |
| High     | 8 hours       | 48 hours        |
| Medium   | 24 hours      | 1 week          |
| Low      | 48 hours      | 2 weeks         |

### 7.3 Scheduled Maintenance

- Last Sunday of every month, 12:00 AM - 4:00 AM IST
- 48-hour advance notice for scheduled maintenance
- Emergency patches with 2-hour notice

### 7.4 SLA Credits

If uptime falls below 99.9%:

- 99.5% - 99.9%: 5% credit on next month's AMC
- 99.0% - 99.5%: 10% credit
- Below 99.0%: 15% credit

---

## ARTICLE 8: CONFIDENTIALITY

### 8.1 Mutual Obligations

Both Parties agree to:

- Maintain strict confidentiality of shared information
- Use confidential information only for agreed purposes
- Implement reasonable security measures
- Not disclose to third parties without consent

### 8.2 Exceptions

Confidentiality does not apply to information that:

- Is publicly available
- Was known prior to disclosure
- Is required by law to be disclosed

### 8.3 Duration

Confidentiality obligations survive for **3 years** after agreement termination.

---

## ARTICLE 9: WARRANTIES & DISCLAIMERS

### 9.1 Service Provider Warranties

Service Provider warrants that:

- Software performs substantially as documented
- Services delivered with professional skill
- No known malicious code in Software
- Does not infringe third-party IP rights

### 9.2 Client Warranties

Client warrants that:

- Has authority to enter this agreement
- Will use Software lawfully
- Will maintain adequate infrastructure
- Data provided is accurate and legal

### 9.3 Disclaimer

**Service Provider does not warrant**:

- Uninterrupted or error-free operation
- Compatibility with all third-party systems
- Results or outcomes from Software use

---

## ARTICLE 10: LIMITATION OF LIABILITY

### 10.1 Liability Cap

Service Provider's total liability under this Agreement shall not exceed the total fees paid by Client in the preceding 12 months.

### 10.2 Excluded Damages

Service Provider not liable for:

- Indirect, incidental, or consequential damages
- Loss of profits, data, or business opportunities
- Client hardware or infrastructure failures
- Third-party API or service failures
- Force majeure events

### 10.3 Client Responsibility

Client solely responsible for:

- Data accuracy and backup
- User account security
- Compliance with applicable laws
- Results obtained from Software use

---

## ARTICLE 11: TERM & TERMINATION

### 11.1 Term

This Agreement commences on the date of signing and continues for an **initial period of 1 year**, renewing automatically thereafter unless terminated.

### 11.2 Termination for Convenience

Either Party may terminate with **90 days written notice**.

### 11.3 Termination for Cause

Either Party may terminate immediately if:

- Material breach not cured within 30 days
- Insolvency or bankruptcy proceedings
- Violation of confidentiality obligations

### 11.4 Effect of Termination

Upon termination:

- Client access to Software ceases
- All outstanding fees become due
- Client data returned/destroyed as per Client instruction
- Confidentiality obligations survive
- License revoked (except perpetual components)

---

## ARTICLE 12: DISPUTE RESOLUTION

### 12.1 Negotiation

Parties shall attempt to resolve disputes through good-faith negotiation for 30 days.

### 12.2 Mediation

If negotiation fails, disputes referred to mediation in Kakinada, AP.

### 12.3 Arbitration

Unresolved disputes settled by arbitration under Arbitration & Conciliation Act, 1996:

- Single arbitrator mutually appointed
- Arbitration in Kakinada, Andhra Pradesh
- English language proceedings
- Decision binding on both Parties

### 12.4 Jurisdiction

Exclusive jurisdiction of courts in **Kakinada, Andhra Pradesh**.

---

## ARTICLE 13: FORCE MAJEURE

Neither Party liable for delays caused by events beyond reasonable control including:

- Natural disasters (floods, earthquakes, pandemics)
- Government actions or regulations
- War, terrorism, civil unrest
- Infrastructure failures (power, internet)

Affected Party must notify other Party within 48 hours.

---

## ARTICLE 14: GENERAL PROVISIONS

### 14.1 Entire Agreement

This Agreement constitutes the entire understanding between Parties and supersedes all prior agreements.

### 14.2 Amendments

Modifications must be in writing and signed by both Parties.

### 14.3 Severability

If any provision is invalid, remaining provisions continue in effect.

### 14.4 Waiver

Failure to enforce any right does not constitute waiver.

### 14.5 Assignment

Client may not assign this Agreement without Service Provider consent.

### 14.6 Notices

All notices to be sent to addresses specified at the beginning of this Agreement via registered post or email.

### 14.7 Governing Law

This Agreement governed by laws of India.

---

## ARTICLE 15: SIGNATURES

**IN WITNESS WHEREOF**, the Parties have executed this Master Service Agreement on the date first written above.

---

**FOR SERVICE PROVIDER: UNIPILOT SOLUTIONS**

Signature: ********\_\_\_\_********  
Name: [Authorized Signatory]  
Designation: Director / Authorized Representative  
Date: ********\_\_\_\_********  
Place: Kakinada, Andhra Pradesh

_Company Seal_

---

**FOR CLIENT: [INSTITUTION NAME]**

Signature: ********\_\_\_\_********  
Name: [Authorized Signatory]  
Designation: ********\_\_\_\_********  
Date: ********\_\_\_\_********  
Place: ********\_\_\_\_********

_Institution Seal_

---

**WITNESS 1 (Service Provider):**

Signature: ********\_\_\_\_********  
Name: ********\_\_\_\_********  
Address: ********\_\_\_\_********

---

**WITNESS 2 (Client):**

Signature: ********\_\_\_\_********  
Name: ********\_\_\_\_********  
Address: ********\_\_\_\_********

---

## ANNEXURES

- **Annexure A**: Detailed Module Specifications
- **Annexure B**: Hardware Requirements & Best Practices
- **Annexure C**: Data Migration Methodology
- **Annexure D**: Training Schedule & Curriculum
- **Annexure E**: Support Escalation Matrix
- **Annexure F**: Security & Compliance Checklist
