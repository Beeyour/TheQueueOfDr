from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    clinic_name: str = Field(..., min_length=1, max_length=255)


class DoctorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    clinic_name: Optional[str] = Field(None, min_length=1, max_length=255)


class DoctorResponse(BaseModel):
    id: str
    name: str
    clinic_name: str
    current_number: int
    created_at: datetime
    updated_at: datetime 
    control_url: str
    view_url: str

    model_config = {"from_attributes": True}


class DoctorDeleteResponse(BaseModel):
    message: str
    id: str


class CounterResponse(BaseModel):
    id: str
    name: str
    clinic_name: str
    current_number: int
    updated_at: datetime 

    model_config = {"from_attributes": True}


class PatientViewResponse(BaseModel):
    clinic_name: str
    current_number: int
    updated_at: datetime