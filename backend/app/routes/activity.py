from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def activity():

    return [
        {
            "title":"Resume Uploaded",
            "time":"2 min ago",
            "type":"upload"
        },
        {
            "title":"AI Score Generated",
            "time":"10 min ago",
            "type":"ai"
        },
        {
            "title":"Interview Scheduled",
            "time":"1 hour ago",
            "type":"interview"
        }
    ]