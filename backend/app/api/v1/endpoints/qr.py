from fastapi import APIRouter, Query
from fastapi.responses import Response
import qrcode
from io import BytesIO
from PIL import Image

router = APIRouter()

@router.get("/qr")
def generate_qr(data: str = Query(..., min_length=1), size: int = Query(120, ge=64, le=512)):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=2,
        border=0,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img = img.convert("RGB")
    img = img.resize((size, size), Image.NEAREST)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")

@router.head("/qr")
def head_qr():
    return Response(status_code=200)
