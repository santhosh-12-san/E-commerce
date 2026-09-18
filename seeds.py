"""
ShopNest E-Commerce - Root Seeding Runner
Runs backend/seeds.py to populate 50 products using native raw SQL.
"""

import sys
import os

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from seeds import seed

if __name__ == "__main__":
    seed()
