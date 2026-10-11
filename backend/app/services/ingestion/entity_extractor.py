import re
from typing import List, Tuple
from app.models.domain import Chunk
from app.services.storage.graph_store import graph_store

class EntityExtractor:
    KNOWN_ENTITIES = [
        ("Employee", "Role"),
        ("Software Engineer", "Role"),
        ("Engineering Manager", "Role"),
        ("CTO", "Role"),
        ("HR Department", "Department"),
        ("Finance Department", "Department"),
        ("Engineering Department", "Department"),
        ("Information Security", "Department"),
        ("Annual Leave", "Concept"),
        ("Casual Leave", "Concept"),
        ("Sick Leave", "Concept"),
        ("Maternity Leave", "Concept"),
        ("Paternity Leave", "Concept"),
        ("Remote Work", "Concept"),
        ("International Travel", "Concept"),
        ("Expense Reimbursement", "Concept"),
        ("Per Diem", "Concept"),
        ("Flight Booking", "Concept"),
        ("Multi-Factor Authentication", "Security"),
        ("Password Expiration", "Security"),
        ("Leave Policy", "Policy"),
        ("Expense Policy", "Policy"),
        ("Travel Policy", "Policy"),
        ("Remote Work Policy", "Policy"),
        ("Cybersecurity IAM Standard", "Policy"),
        ("Employee Handbook", "Policy"),
        ("Jira Service Desk", "Tool"),
        ("HR Portal", "Tool"),
    ]

    RELATION_RULES: List[Tuple[str, str, str]] = [
        ("Employee", "entitled_to", "Annual Leave"),
        ("Employee", "entitled_to", "Casual Leave"),
        ("Employee", "entitled_to", "Expense Reimbursement"),
        ("Annual Leave", "governed_by", "Leave Policy"),
        ("Casual Leave", "governed_by", "Leave Policy"),
        ("Maternity Leave", "governed_by", "Leave Policy"),
        ("International Travel", "governed_by", "Travel Policy"),
        ("International Travel", "reimbursed_under", "Expense Policy"),
        ("Flight Booking", "governed_by", "Travel Policy"),
        ("Remote Work", "governed_by", "Remote Work Policy"),
        ("Remote Work", "applies_to", "Software Engineer"),
        ("Multi-Factor Authentication", "mandated_by", "Cybersecurity IAM Standard"),
        ("Password Expiration", "governed_by", "Cybersecurity IAM Standard"),
        ("Leave Policy", "supersedes", "Employee Handbook"),
        ("Software Engineer", "reports_to", "Engineering Manager"),
        ("Engineering Manager", "reports_to", "CTO"),
    ]

    def extract_and_link(self, chunks: List[Chunk]):
        for chunk in chunks:
            text = chunk.content
            detected_in_chunk = []

            for ent_name, ent_type in self.KNOWN_ENTITIES:
                pattern = re.compile(r'\b' + re.escape(ent_name) + r'\b', re.IGNORECASE)
                if pattern.search(text) or pattern.search(chunk.document_title):
                    detected_in_chunk.append(ent_name)
                    graph_store.add_node(
                        node_id=ent_name,
                        label=ent_name,
                        node_type=ent_type,
                        department=chunk.department,
                        metadata={"source_doc": chunk.document_title, "page": chunk.page_number}
                    )

            # Connect chunk document to concepts
            doc_node = chunk.document_title
            graph_store.add_node(doc_node, doc_node, "Policy", department=chunk.department)

            for ent in detected_in_chunk:
                graph_store.add_edge(doc_node, ent, "defines", weight=1.0)

            chunk.entities = detected_in_chunk

        # Add domain relation rules to graph
        for src, rel, tgt in self.RELATION_RULES:
            graph_store.add_edge(src, tgt, rel, weight=1.0)

entity_extractor = EntityExtractor()
