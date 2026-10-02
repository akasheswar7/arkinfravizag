import logging
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import get_collection
from app.core.security import hash_password

logger = logging.getLogger(__name__)

async def seed_initial_database():
    """
    Ensures the default admin account exists if no admin is present.
    Does NOT seed dummy agents, directors, customers, or gallery items.
    """
    admins_col = get_collection("admins")
    now = datetime.now(timezone.utc)

    # Admin Seed
    admin_count = await admins_col.count_documents({})
    if admin_count == 0:
        logger.info(f"Seeding default admin: {settings.ADMIN_EMAIL}")
        await admins_col.insert_one({
            "email": settings.ADMIN_EMAIL.lower().strip(),
            "username": "admin",
            "hashed_password": hash_password(settings.ADMIN_PASSWORD),
            "full_name": "ARK Infra Executive Admin",
            "role": "admin",
            "created_at": now
        })
    logger.info("Database startup check completed.")
