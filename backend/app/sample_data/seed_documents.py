from datetime import datetime
from app.models.domain import Document, KnowledgeSpace
from app.services.ingestion.chunker import chunker
from app.services.ingestion.entity_extractor import entity_extractor
from app.services.storage.bm25_store import bm25_store
from app.services.storage.metadata_db import db
from app.services.storage.vector_store import vector_store

DEFAULT_SPACES = [
    KnowledgeSpace(
        id="company-wide",
        name="All Knowledge",
        description="Global enterprise knowledge base spanning all departments and policies",
        department="Organization",
        icon="globe"
    ),
    KnowledgeSpace(
        id="hr",
        name="Human Resources",
        description="Leave, benefits, code of conduct, and employment guidelines",
        department="HR",
        icon="users"
    ),
    KnowledgeSpace(
        id="engineering",
        name="Engineering",
        description="Architecture, coding standards, reporting hierarchy, and technical specs",
        department="Engineering",
        icon="code"
    ),
    KnowledgeSpace(
        id="finance",
        name="Finance & Expenses",
        description="Travel reimbursement, per diem, billing, and procurement policies",
        department="Finance",
        icon="dollar-sign"
    ),
    KnowledgeSpace(
        id="security",
        name="Cybersecurity",
        description="IAM standards, authentication, access control, and data protection",
        department="Security",
        icon="shield"
    ),
    KnowledgeSpace(
        id="project-alpha",
        name="Project Alpha",
        description="Dedicated project space for Project Alpha and Horizon initiatives",
        department="Engineering",
        icon="folder"
    )
]

SEED_DOCUMENTS_DATA = [
    {
        "id": "doc-leave-2026",
        "filename": "LeavePolicy2026.pdf",
        "title": "Employee Leave Policy 2026",
        "department": "HR",
        "effective_date": "2026-04-01",
        "version": "4.1",
        "authority": "official_policy",
        "owner": "HR Department",
        "visibility": "internal",
        "space_id": "hr",
        "content": """# Employee Leave Policy 2026
Version 4.1 | Effective: April 1, 2026 | Authority: Official HR Policy

## Section 1: Annual Leave Entitlements
Employees receive 24 days of annual leave per calendar year, accrued at 2.0 days per completed month of service. This represents an official increase from the former 21-day entitlement defined in legacy handbooks. Unused annual leave up to 10 days may be carried forward into the subsequent calendar year.

## Section 2: Casual and Sick Leave
Full-time personnel are granted 7 days of casual leave and 10 days of paid sick leave annually. Casual leave may be taken in half-day increments.

## Section 3: Combining Leave with Overseas Business Travel
An employee is explicitly permitted to take annual leave immediately after an overseas business trip and still claim the full cost of the return flight, provided that:
1. The return flight cost on the deferred departure date does not exceed the direct return ticket cost on the official work conclusion date.
2. The personal leave days are approved in writing by the employee's line manager prior to departure.
3. Any additional lodging, meal, or transit costs incurred during the personal leave period are borne by the employee without reimbursement."""
    },
    {
        "id": "doc-handbook-2024",
        "filename": "EmployeeHandbook2024.pdf",
        "title": "Employee Handbook (General)",
        "department": "General",
        "effective_date": "2024-01-15",
        "version": "1.0",
        "authority": "guideline",
        "owner": "People Operations",
        "visibility": "internal",
        "space_id": "company-wide",
        "content": """# Employee Handbook
Version 1.0 | Effective: January 15, 2024 | Authority: General Guideline

## Section 4.2: Time Off and Leave
All standard employees receive 21 days of annual leave per calendar year. Leave must be scheduled at least two weeks in advance. Unused days are forfeited at year end unless granted special exemption.

## Section 8.1: General IT and Password Security
All corporate computer passwords must be at least 12 characters in length and include at least one number. Employees are required to change their passwords every 90 days.

## Section 12.3: Employment Location and Office Attendance
All staff are contracted to their assigned primary office located in Maharashtra. Working permanently outside Maharashtra requires written executive exemption."""
    },
    {
        "id": "doc-travel-expense",
        "filename": "TravelExpensePolicy.pdf",
        "title": "Corporate Travel & Expense Policy",
        "department": "Finance",
        "effective_date": "2025-08-01",
        "version": "3.0",
        "authority": "official_policy",
        "owner": "Finance Department",
        "visibility": "internal",
        "space_id": "finance",
        "content": """# Corporate Travel & Expense Policy
Version 3.0 | Effective: August 1, 2025 | Authority: Official Finance Policy

## Section 2.1: Flight Bookings & Travel Extensions
All international business flights must be booked in economy class for journeys under 7 hours and premium economy/business for transatlantic routes exceeding 7 hours.
If an employee combines personal holiday with business travel, the round-trip return flight remains 100% reimbursable under company travel expenses provided the ticket fare does not exceed the baseline business itinerary cost.

## Section 3.4: Per Diem and Incidentals
Employees on official overseas assignment receive a daily per diem allowance of $75 USD for meals and incidentals. Per diem applies strictly to official assignment days and cannot be claimed during personal leave extensions."""
    },
    {
        "id": "doc-remote-work",
        "filename": "RemoteWorkPolicy.pdf",
        "title": "Flexible & Remote Work Policy",
        "department": "HR",
        "effective_date": "2025-11-01",
        "version": "2.2",
        "authority": "official_policy",
        "owner": "HR Department",
        "visibility": "internal",
        "space_id": "hr",
        "content": """# Flexible & Remote Work Policy
Version 2.2 | Effective: November 1, 2025 | Authority: Official HR Policy

## Section 1.0: Geographic Mobility & Out-of-State Work
While company headquarters is situated in Maharashtra, full-time employees in designated technical tracks (including Software Engineers, Data Engineers, and DevOps) are authorized to work permanently remotely from any location within India.

## Section 2.3: Regulatory and Tax Compliance
Engineers working permanently outside Maharashtra must submit their current residential address and state tax residency details to HR Operations. Approval from the Engineering Manager and a simple HR addendum are required."""
    },
    {
        "id": "doc-cybersecurity-iam",
        "filename": "CybersecurityIAMStandard.pdf",
        "title": "Cybersecurity Identity & Access Management Standard",
        "department": "Information Security",
        "effective_date": "2026-02-10",
        "version": "5.0",
        "authority": "standard",
        "owner": "Information Security",
        "visibility": "internal",
        "space_id": "security",
        "content": """# Cybersecurity IAM Standard
Version 5.0 | Effective: February 10, 2026 | Authority: Enterprise Security Standard

## Section 2.4: Password Complexity & Authentication Standard
In compliance with zero-trust mandates, all user accounts must utilize a minimum password length of 14 characters. Passwords must incorporate uppercase, lowercase, numbers, and symbols.
Multi-Factor Authentication (MFA) via FIDO2 hardware keys or authenticator apps is strictly mandatory for all internal and external access.

## Section 2.5: Password Expiration Deprecation
Mandatory 90-day periodic password expiration is formally deprecated and disabled. Passwords do not expire automatically unless a credential compromise or anomalous risk trigger is detected by the Security Operations Center (SOC)."""
    },
    {
        "id": "doc-eng-guidelines",
        "filename": "EngineeringGuidelines.pdf",
        "title": "Engineering Organization Guidelines & Architecture",
        "department": "Engineering",
        "effective_date": "2025-10-15",
        "version": "1.8",
        "authority": "sop",
        "owner": "Engineering Leadership",
        "visibility": "internal",
        "space_id": "engineering",
        "content": """# Engineering Organization Guidelines
Version 1.8 | Effective: October 15, 2025 | Authority: Standard Operating Procedure

## Section 1.3: Reporting Hierarchy & Governance
Within the Technology Group, Software Engineers report directly to their assigned Engineering Manager. Engineering Managers report directly to the Chief Technology Officer (CTO).

## Section 3.2: Project Alpha and Remote Engineers
Under the Project Alpha & Horizon initiatives, engineers based outside Maharashtra are officially approved for permanent remote work. Sprint ceremonies, Jira tracking, and architectural reviews are conducted asynchronously."""
    }
]

def seed_database_if_empty():
    existing_spaces = db.list_spaces()
    if not existing_spaces:
        for sp in DEFAULT_SPACES:
            db.insert_space(sp)

    existing_docs = db.list_documents()
    if not existing_docs:
        all_chunks = []
        for doc_info in SEED_DOCUMENTS_DATA:
            doc = Document(
                id=doc_info["id"],
                filename=doc_info["filename"],
                title=doc_info["title"],
                department=doc_info["department"],
                effective_date=doc_info["effective_date"],
                version=doc_info["version"],
                authority=doc_info["authority"],
                owner=doc_info["owner"],
                visibility=doc_info["visibility"],
                space_id=doc_info["space_id"],
                file_type="markdown",
                created_at=datetime.now().isoformat(),
                last_updated=doc_info["effective_date"]
            )

            segments = []
            sections = doc_info["content"].split("## ")
            for idx, sec in enumerate(sections):
                if not sec.strip():
                    continue
                lines = sec.strip().splitlines()
                title = lines[0].replace("#", "").strip()
                body = "\n".join(lines[1:]).strip()
                segments.append({
                    "page_number": idx + 1,
                    "section_title": title if title else f"Section {idx+1}",
                    "text": body if body else sec
                })

            doc_chunks = chunker.chunk_document(doc, segments)
            doc.chunk_count = len(doc_chunks)

            db.insert_document(doc)
            db.insert_chunks(doc_chunks)
            all_chunks.extend(doc_chunks)

        entity_extractor.extract_and_link(all_chunks)

        chunk_dicts = [{"id": c.id, "text": f"{c.document_title} - {c.section_title}: {c.content}"} for c in all_chunks]
        vector_store.rebuild_index(chunk_dicts)
        bm25_store.rebuild_index(chunk_dicts)
    else:
        all_chunks = db.get_all_chunks()
        entity_extractor.extract_and_link(all_chunks)
        chunk_dicts = [{"id": c.id, "text": f"{c.document_title} - {c.section_title}: {c.content}"} for c in all_chunks]
        vector_store.rebuild_index(chunk_dicts)
        bm25_store.rebuild_index(chunk_dicts)
