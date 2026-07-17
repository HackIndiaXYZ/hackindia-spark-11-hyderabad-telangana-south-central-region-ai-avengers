from sqlalchemy import Column, String, ForeignKey, Enum, Float, Integer, DateTime, Boolean, JSON, Uuid
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin
from .gesture import GestureType, NeedType

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FALSE_POSITIVE = "false_positive"

class Detection(Base, TimestampMixin):
    __tablename__ = "detections"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid, ForeignKey("patients.id"), nullable=False)
    gesture_type = Column(Enum(GestureType), nullable=False)
    need_type = Column(Enum(NeedType), nullable=False)
    confidence = Column(Float, nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)
    
    # Response tracking
    acknowledged_by = Column(String(100))  # Nurse ID
    acknowledged_at = Column(DateTime)
    completed_at = Column(DateTime)
    response_time_ms = Column(Integer)  # Time from detection to acknowledgment
    
    # For analytics
    was_false_positive = Column(Boolean, default=False)
    
    patient = relationship("Patient", back_populates="detections")
    
    def __repr__(self):
        return f"<Detection {self.need_type} for patient {self.patient_id}>"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False)
    event_type = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Uuid)
    actor_id = Column(String(100))  # User/nurse who performed action
    details = Column(JSON)
    ip_address = Column(String(45))
