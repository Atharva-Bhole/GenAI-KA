from typing import Dict, Any, Optional
from app.models.domain import ActionRequest
from app.services.agents.tools import tools

class ActionExecutor:
    def propose_action(self, action_type: str, query: str, user_id: str) -> Optional[ActionRequest]:
        if action_type == "leave_request":
            return ActionRequest(
                action_type="leave_request",
                title="Submit Leave Application (HR Portal)",
                parameters={
                    "user_id": user_id,
                    "leave_type": "Casual Leave",
                    "date": "Friday",
                    "reason": "Personal time off"
                },
                requires_confirmation=True,
                status="proposed"
            )
        elif action_type == "jira_ticket":
            return ActionRequest(
                action_type="jira_ticket",
                title="Create Jira Issue (Engineering Backlog)",
                parameters={
                    "project_key": "PLAT",
                    "summary": f"Policy Compliance Task: {query[:50]}",
                    "description": f"Automated ticket spawned from Knowledge Assistant query: {query}",
                    "priority": "Medium"
                },
                requires_confirmation=True,
                status="proposed"
            )
        elif action_type == "email_notification":
            return ActionRequest(
                action_type="email_notification",
                title="Dispatch Policy Digest (Email Gateway)",
                parameters={
                    "recipients": "team@company.internal",
                    "subject": "Corporate Policy Guidance & Summary",
                    "body": f"Guidance regarding: {query}"
                },
                requires_confirmation=True,
                status="proposed"
            )
        return None

    def execute_action(self, action_type: str, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        if action_type == "leave_request":
            return tools.submit_leave_request(
                user_id=params.get("user_id", user_id),
                leave_type=params.get("leave_type", "Casual Leave"),
                date=params.get("date", "Friday"),
                reason=params.get("reason", "Personal")
            )
        elif action_type == "jira_ticket":
            return tools.create_jira_issue(
                project_key=params.get("project_key", "PLAT"),
                summary=params.get("summary", "Knowledge Task"),
                description=params.get("description", "Details"),
                priority=params.get("priority", "Medium")
            )
        elif action_type == "email_notification":
            return tools.send_email_summary(
                recipients=params.get("recipients", "team@company.internal"),
                subject=params.get("subject", "Policy Digest"),
                body=params.get("body", "Content")
            )
        else:
            raise ValueError(f"Unknown action type: {action_type}")

action_executor = ActionExecutor()
