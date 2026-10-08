from decimal import Decimal
import pytest
from app.services.loyalty import points_for_order

def test_points_are_whole_numbers():
    assert points_for_order(Decimal("225000"),1000)==225
    assert points_for_order(Decimal("999"),1000)==0
    assert points_for_order(Decimal("-1"),1000)==0

def test_invalid_ratio_rejected():
    with pytest.raises(ValueError):
        points_for_order(Decimal("10000"),0)
