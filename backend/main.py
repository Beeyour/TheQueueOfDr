from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Doctor
from schemas import (
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse,
    DoctorDeleteResponse,
    CounterResponse,
    PatientViewResponse,
)
from qr_utils import generate_qr_codes, get_qr_image

app = FastAPI(
    title="Hospital Queue Management System",
    description="Digital counter system replacing paper-based hospital queues",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# --- Admin Endpoints ---


@app.get("/doctors", response_model=list[DoctorResponse])
def list_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()
    result = []
    for doctor in doctors:
        qr_info = generate_qr_codes(doctor.id)
        result.append(DoctorResponse(
            id=doctor.id,
            name=doctor.name,
            clinic_name=doctor.clinic_name,
            current_number=doctor.current_number,
            created_at=doctor.created_at,
            control_url=qr_info["control_url"],
            view_url=qr_info["view_url"],
        ))
    return result


@app.post("/doctors", response_model=DoctorResponse, status_code=201)
def create_doctor(payload: DoctorCreate, db: Session = Depends(get_db)):
    doctor = Doctor(name=payload.name, clinic_name=payload.clinic_name)
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    qr_info = generate_qr_codes(doctor.id)

    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        clinic_name=doctor.clinic_name,
        current_number=doctor.current_number,
        created_at=doctor.created_at,
        control_url=qr_info["control_url"],
        view_url=qr_info["view_url"],
    )


@app.patch("/doctors/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: str, payload: DoctorUpdate, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if payload.name is not None:
        doctor.name = payload.name
    if payload.clinic_name is not None:
        doctor.clinic_name = payload.clinic_name

    db.commit()
    db.refresh(doctor)

    qr_info = generate_qr_codes(doctor.id)

    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        clinic_name=doctor.clinic_name,
        current_number=doctor.current_number,
        created_at=doctor.created_at,
        control_url=qr_info["control_url"],
        view_url=qr_info["view_url"],
    )


@app.delete("/doctors/{doctor_id}", response_model=DoctorDeleteResponse)
def delete_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db.delete(doctor)
    db.commit()

    return DoctorDeleteResponse(message="Doctor deleted successfully", id=doctor_id)


# --- Doctor (Control) Endpoints ---


@app.post("/dr/{doctor_id}/increment", response_model=CounterResponse)
def increment_counter(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if doctor.current_number >= 100:
        raise HTTPException(status_code=400, detail="Counter has reached the maximum limit of 100")

    doctor.current_number += 1
    db.commit()
    db.refresh(doctor)

    return CounterResponse(
        id=doctor.id, name=doctor.name, clinic_name=doctor.clinic_name, current_number=doctor.current_number
    )


@app.post("/dr/{doctor_id}/decrement", response_model=CounterResponse)
def decrement_counter(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if doctor.current_number <= 0:
        raise HTTPException(status_code=400, detail="Counter is already at 0")

    doctor.current_number -= 1
    db.commit()
    db.refresh(doctor)

    return CounterResponse(
        id=doctor.id, name=doctor.name, clinic_name=doctor.clinic_name, current_number=doctor.current_number
    )


@app.post("/dr/{doctor_id}/reset", response_model=CounterResponse)
def reset_counter(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor.current_number = 0
    db.commit()
    db.refresh(doctor)

    return CounterResponse(
        id=doctor.id, name=doctor.name, clinic_name=doctor.clinic_name, current_number=doctor.current_number
    )


# --- Patient (View) Endpoint ---


@app.get("/patient/{doctor_id}", response_model=PatientViewResponse)
def get_current_number(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return PatientViewResponse(clinic_name=doctor.clinic_name, current_number=doctor.current_number)


# --- QR Code Download Endpoints ---


@app.get("/qr/control/{doctor_id}")
def download_control_qr(doctor_id: str):
    from qr_utils import QR_DIR
    import os

    path = os.path.join(QR_DIR, f"control_{doctor_id}.png")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="QR code not found")

    return StreamingResponse(
        get_qr_image(path), media_type="image/png", headers={"Content-Disposition": f"attachment; filename=control_{doctor_id}.png"}
    )


@app.get("/qr/view/{doctor_id}")
def download_view_qr(doctor_id: str):
    from qr_utils import QR_DIR
    import os

    path = os.path.join(QR_DIR, f"view_{doctor_id}.png")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="QR code not found")

    return StreamingResponse(
        get_qr_image(path), media_type="image/png", headers={"Content-Disposition": f"attachment; filename=view_{doctor_id}.png"}
    )
