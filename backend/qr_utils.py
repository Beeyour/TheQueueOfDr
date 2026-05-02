import os
import io

import qrcode

# FRONTEND_URL is where the QR codes should point (React app)
FRONTEND_URL = "http://localhost:5173"
QR_DIR = "qr_codes"


def _ensure_qr_dir():
    os.makedirs(QR_DIR, exist_ok=True)


def generate_qr_codes(doctor_id: str) -> dict:
    _ensure_qr_dir()

    # QR codes point to the FRONTEND (React app) not the backend
    control_url = f"{FRONTEND_URL}/dr/{doctor_id}"
    view_url = f"{FRONTEND_URL}/patient/{doctor_id}"

    control_path = os.path.join(QR_DIR, f"control_{doctor_id}.png")
    view_path = os.path.join(QR_DIR, f"view_{doctor_id}.png")

    qr_control = qrcode.QRCode(version=1, box_size=10, border=4)
    qr_control.add_data(control_url)
    qr_control.make(fit=True)
    img_control = qr_control.make_image(fill_color="black", back_color="white")
    img_control.save(control_path)

    qr_view = qrcode.QRCode(version=1, box_size=10, border=4)
    qr_view.add_data(view_url)
    qr_view.make(fit=True)
    img_view = qr_view.make_image(fill_color="black", back_color="white")
    img_view.save(view_path)

    return {
        "control_url": control_url,
        "view_url": view_url,
        "control_qr_path": control_path,
        "view_qr_path": view_path,
    }


def get_qr_image(path: str) -> io.BytesIO:
    buf = io.BytesIO()
    with open(path, "rb") as f:
        buf.write(f.read())
    buf.seek(0)
    return buf
