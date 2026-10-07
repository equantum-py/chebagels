import uuid
from unittest.mock import MagicMock
import pytest
from app.models.core import Order,OrderStatus,OrderType
from app.services.operations import change_order_status,OrderOperationError

def make_order(order_type=OrderType.DELIVERY,status=OrderStatus.RECEIVED):
    return Order(id=uuid.uuid4(),order_number="CH-TEST",branch_id=uuid.uuid4(),customer_id=uuid.uuid4(),order_type=order_type,status=status,source="WEB",subtotal=0,delivery_fee=0,total=0)

def test_delivery_happy_path():
    db=MagicMock(); order=make_order()
    for status in [OrderStatus.CONFIRMED,OrderStatus.PREPARING,OrderStatus.READY,OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERED]:
        change_order_status(db,order,status)
        assert order.status==status

def test_pickup_happy_path():
    db=MagicMock(); order=make_order(OrderType.PICKUP)
    for status in [OrderStatus.CONFIRMED,OrderStatus.PREPARING,OrderStatus.READY,OrderStatus.PICKED_UP]:
        change_order_status(db,order,status)
        assert order.status==status

def test_pickup_cannot_go_out_for_delivery():
    db=MagicMock(); order=make_order(OrderType.PICKUP,OrderStatus.READY)
    with pytest.raises(OrderOperationError):
        change_order_status(db,order,OrderStatus.OUT_FOR_DELIVERY)

def test_delivery_cannot_be_picked_up():
    db=MagicMock(); order=make_order(OrderType.DELIVERY,OrderStatus.READY)
    with pytest.raises(OrderOperationError):
        change_order_status(db,order,OrderStatus.PICKED_UP)

def test_cannot_skip_kitchen():
    db=MagicMock(); order=make_order(status=OrderStatus.CONFIRMED)
    with pytest.raises(OrderOperationError):
        change_order_status(db,order,OrderStatus.READY)
