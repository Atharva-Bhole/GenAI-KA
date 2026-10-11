import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.models.schemas import QueryRequest
from app.sample_data.seed_documents import seed_database_if_empty
from app.services.reasoning.synthesizer import synthesizer
from app.services.storage.metadata_db import db

seed_database_if_empty()
docs = db.list_documents()

test_req1 = QueryRequest(query="What is our annual leave policy entitlement and has anything changed since last year?", research_mode=False)
res1 = synthesizer.process_query(test_req1)
assert len(res1.citations) > 0
assert res1.conflict_report is not None

test_req2 = QueryRequest(query="Apply for leave this Friday", research_mode=False)
res2 = synthesizer.process_query(test_req2)
assert res2.proposed_action is not None

test_req3 = QueryRequest(query="What is our policy for employees using personal AI tools?", research_mode=False)
res3 = synthesizer.process_query(test_req3)
assert res3.knowledge_gap is not None

print(f"Verified {len(docs)} documents and test queries successfully.")
