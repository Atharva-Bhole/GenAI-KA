from fastapi import APIRouter, HTTPException
from app.models.schemas import ActionExecuteRequest, ActionExecuteResponse
from app.services.agents.action_executor import action_executor

router = APIRouter()

@router.post("/execute", response_model=ActionExecuteResponse)
def execute_agent_action(request: ActionExecuteRequest):
    try:
        result = action_executor.execute_action(
            action_type=request.action_type,
            params=request.parameters,
            user_id=request.user_id
        )
        return ActionExecuteResponse(
            success=True,
            action_type=request.action_type,
            message=result.get("message", "Action successfully executed."),
            details=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute workflow action: {str(e)}")
