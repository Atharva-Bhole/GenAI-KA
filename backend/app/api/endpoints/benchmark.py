from fastapi import APIRouter
from app.models.schemas import BenchmarkRunResponse
from app.services.benchmark.evaluator import evaluator

router = APIRouter()

@router.post("/run", response_model=BenchmarkRunResponse)
def run_benchmark():
    return evaluator.run_evaluation()

