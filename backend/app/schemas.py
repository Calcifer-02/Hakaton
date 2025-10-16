from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EnterpriseStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class EnterpriseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    industry: str = Field(..., min_length=1, max_length=100)
    region: str = Field(..., min_length=1, max_length=100)
    employees: int = Field(..., ge=0)
    revenue: float = Field(..., ge=0)
    taxes_paid: Optional[float] = Field(None, ge=0)
    registration_date: Optional[datetime] = None
    status: EnterpriseStatus = EnterpriseStatus.ACTIVE
    address: str = Field(..., min_length=1)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)

class EnterpriseCreate(EnterpriseBase):
    pass

class EnterpriseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, min_length=1, max_length=100)
    region: Optional[str] = Field(None, min_length=1, max_length=100)
    employees: Optional[int] = Field(None, ge=0)
    revenue: Optional[float] = Field(None, ge=0)
    taxes_paid: Optional[float] = Field(None, ge=0)
    registration_date: Optional[datetime] = None
    status: Optional[EnterpriseStatus] = None
    address: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)

class Enterprise(EnterpriseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    source_file: Optional[str] = None
    is_validated: bool = False

    class Config:
        from_attributes = True

class EnterpriseList(BaseModel):
    enterprises: List[Enterprise]
    total: int
    page: int
    size: int
    total_pages: int

class IndustryStats(BaseModel):
    industry: str
    count: int
    total_revenue: float
    average_revenue: float
    total_employees: int
    average_employees: float

class RegionStats(BaseModel):
    region: str
    count: int
    total_revenue: float
    average_revenue: float
    total_employees: int
    average_employees: float

class DataQuality(BaseModel):
    total_records: int
    valid_records: int
    invalid_records: int
    validation_errors: List[str]
    error_rate: float

class UploadStatus(BaseModel):
    id: int
    filename: str
    file_size: int
    file_type: str
    upload_date: datetime
    status: str
    processed_records: int
    error_records: int
    error_details: Optional[str] = None
    processing_time: Optional[float] = None

class UploadResponse(BaseModel):
    success: bool
    message: str
    upload_id: int
    processed_count: int
    error_count: int
    errors: List[str]

class AggregateData(BaseModel):
    industries: List[IndustryStats]
    regions: List[RegionStats]
    total_enterprises: int
    total_revenue: float
    total_employees: int
    average_revenue: float
    average_employees: float

class FilterParams(BaseModel):
    industries: Optional[List[str]] = None
    regions: Optional[List[str]] = None
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    min_revenue: Optional[float] = None
    max_revenue: Optional[float] = None
    status: Optional[List[EnterpriseStatus]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
