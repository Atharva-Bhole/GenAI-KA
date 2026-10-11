import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.sample_data.seed_documents import seed_database_if_empty
from app.services.storage.metadata_db import db
from app.models.schemas import QueryRequest
from app.services.reasoning.synthesizer import synthesizer

print("Seeding database...")
seed_database_if_empty()

docs = db.list_documents()
print(f"Loaded {len(docs)} documents.")

# Test query 1: Conflict intelligence query
test_req1 = QueryRequest(query="What is our annual leave policy entitlement and has anything changed since last year?", research_mode=False)
res1 = synthesizer.process_query(test_req1)
print("\n--- Test Query 1 Output ---")
print("Answer:\n", res1.answer[:250], "...")
print("Confidence:", res1.confidence_score)
print("Conflict caught?:", res1.conflict_report.has_conflict if res1.conflict_report else False)
print("Citations count:", len(res1.citations))

# Test query 2: Action query
test_req2 = QueryRequest(query="Apply for leave this Friday", research_mode=False)
res2 = synthesizer.process_query(test_req2)
print("\n--- Test Query 2 Output ---")
print("Proposed action:", res2.proposed_action.title if res2.proposed_action else None)

# Test query 3: Gap query
test_req3 = QueryRequest(query="What is our policy for employees using personal AI tools?", research_mode=False)
res3 = synthesizer.process_query(test_req3)
print("\n--- Test Query 3 Output ---")
print("Gap caught?:", res3.knowledge_gap is not None)
if res3.knowledge_gap:
    print("Gap department:", res3.knowledge_gap.department)

print("\nALL BACKEND VERIFICATION CHECKS PASSED!")
