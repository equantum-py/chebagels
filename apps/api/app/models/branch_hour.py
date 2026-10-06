import uuid
from datetime import time
from sqlalchemy import Boolean,CheckConstraint,ForeignKey,SmallInteger,Time,UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped,mapped_column
from app.db.base import Base
from app.models.core import TimestampMixin
class BranchHour(TimestampMixin,Base):
    __tablename__="branch_hours"
    id:Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    branch_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("branches.id",ondelete="CASCADE"),nullable=False)
    day_of_week:Mapped[int]=mapped_column(SmallInteger,nullable=False)
    opens_at:Mapped[time|None]=mapped_column(Time)
    closes_at:Mapped[time|None]=mapped_column(Time)
    is_closed:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    delivery_enabled:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    pickup_enabled:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    __table_args__=(UniqueConstraint("branch_id","day_of_week"),CheckConstraint("day_of_week between 0 and 6",name="valid_day_of_week"))
