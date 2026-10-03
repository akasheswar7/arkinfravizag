import logging
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from app.core.security import get_current_admin
from app.services.image_service import validate_image_upload, process_and_optimize_image
from app.services.storage_service import storage_service

router = APIRouter(prefix="/admin", tags=["File & Photo Uploads"])
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_photo(
    file: UploadFile = File(...),
    folder: str = Form(default="general"),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Handles robust photo & video upload:
    1. Supports MP4, WEBM, MOV video files
    2. Validates image extension, MIME type, file size
    3. Auto-rotates orientation by EXIF & compresses images to WebP
    4. Saves to storage and returns direct URLs
    """
    try:
        contents = await file.read()
        file_size = len(contents)
        content_type = (file.content_type or "").lower()
        filename = file.filename or "file"
        ext = "." + filename.split(".")[-1].lower() if "." in filename else ""

        # Handle Video File Uploads (MP4, WEBM, MOV, AVI)
        if content_type.startswith("video/") or ext in {".mp4", ".mov", ".avi", ".webm", ".m4v"}:
            if file_size > 50 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Video file too large. Maximum allowed size for direct video upload is 50MB."
                )
            unique_id = uuid.uuid4().hex[:12]
            video_name = f"vid_{unique_id}{ext if ext else '.mp4'}"
            mime_type = content_type if content_type.startswith("video/") else "video/mp4"
            video_url = await storage_service.save_file(contents, video_name, mime_type)

            logger.info(f"Video uploaded successfully: {video_name} ({file_size} bytes)")
            return {
                "success": True,
                "url": video_url,
                "video_url": video_url,
                "thumbnail_url": "images/logo.webp",
                "filename": video_name,
                "original_filename": file.filename,
                "size_bytes": file_size,
                "is_video": True,
                "message": "Video file uploaded successfully."
            }

        # Handle Image Uploads
        validate_image_upload(content_type, file_size, filename)

        max_dim = 1600 if folder == "gallery" else 800
        main_bytes, main_name, thumb_bytes, thumb_name = process_and_optimize_image(
            contents,
            max_dimension=max_dim,
            quality=85,
            make_thumbnail=True
        )

        main_url = await storage_service.save_file(main_bytes, main_name, "image/webp")
        thumb_url = None
        if thumb_bytes and thumb_name:
            thumb_url = await storage_service.save_file(thumb_bytes, thumb_name, "image/webp")

        logger.info(f"Photo uploaded successfully: {main_name} ({file_size} -> {len(main_bytes)} bytes)")

        return {
            "success": True,
            "url": main_url,
            "thumbnail_url": thumb_url or main_url,
            "filename": main_name,
            "original_filename": file.filename,
            "size_bytes": len(main_bytes),
            "is_video": False,
            "message": "Photo uploaded and optimized successfully."
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload handler failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and store uploaded file: {str(e)}"
        )

