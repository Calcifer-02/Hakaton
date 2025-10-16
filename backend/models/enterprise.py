from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum
from datetime import datetime

Base = declarative_base()

class EnterpriseStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Enterprise(Base):
    __tablename__ = "enterprises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    industry = Column(String(100), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    employees = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=False)
    taxes_paid = Column(Float, nullable=True)
    registration_date = Column(DateTime, nullable=True)
    status = Column(Enum(EnterpriseStatus), default=EnterpriseStatus.ACTIVE)

    # Contact information
    address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Data quality tracking
    source_file = Column(String(255), nullable=True)
    is_validated = Column(Boolean, default=False)

class DataUpload(Base):
    __tablename__ = "data_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    upload_date = Column(DateTime, default=func.now())

    # Processing status
    status = Column(String(50), default="uploaded")  # uploaded, processing, completed, failed
    processed_records = Column(Integer, default=0)
    error_records = Column(Integer, default=0)
    error_details = Column(Text, nullable=True)

    # Processing metadata
    processing_time = Column(Float, nullable=True)
    processed_at = Column(DateTime, nullable=True)

class DataQualityLog(Base):
    __tablename__ = "data_quality_logs"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, nullable=False)
    enterprise_name = Column(String(255), nullable=True)
    row_number = Column(Integer, nullable=False)
    error_type = Column(String(100), nullable=False)
    error_message = Column(Text, nullable=False)
    field_name = Column(String(100), nullable=True)
    field_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
